<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Services;

use App\Domains\EnterpriseCore\DesktopDistribution\Models\DesktopDevice;
use App\Domains\EnterpriseCore\IdentityAccess\Models\LoginAttempt;
use App\Domains\EnterpriseCore\IdentityAccess\Models\Session;
use App\Domains\EnterpriseCore\IdentityAccess\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session as SessionFacade;
use Illuminate\Support\Str;

/**
 * Manages ERP sessions. Desktop sessions use a short-lived access token and a
 * hash-only refresh credential bound to a registered, non-revoked device.
 */
class AuthService
{
    private const ACCESS_TOKEN_LIFETIME = 900;

    private const REFRESH_TOKEN_LIFETIME = 2_592_000;

    private const MAX_LOGIN_ATTEMPTS = 3;

    private const THROTTLE_BASE_TIME = 60;

    public function login(string $username, string $password, ?DesktopDevice $desktopDevice = null): array
    {
        $throttle = $this->checkThrottle($username);
        if ($throttle['locked']) {
            return [
                'success' => false,
                'message' => 'Account locked. Please wait '.ceil($throttle['wait_time'] / 60).' minutes before trying again.',
            ];
        }

        if (! Auth::attempt(['username' => $username, 'password' => $password])) {
            $this->recordFailedAttempt($username);

            return ['success' => false, 'message' => 'Invalid username or password'];
        }

        /** @var User $user */
        $user = Auth::user();
        if (! $user->is_active) {
            Auth::logout();

            return ['success' => false, 'message' => 'Account is inactive'];
        }

        $this->clearFailedAttempts($username);

        return ['success' => true, 'user_id' => $user->id, ...$this->createSession($user, $desktopDevice)];
    }

    public function refreshDesktopSession(
        DesktopDevice $desktopDevice,
        string $refreshToken,
    ): array {
        return DB::transaction(function () use ($desktopDevice, $refreshToken): array {
            $session = Session::query()
                ->where('desktop_device_id', $desktopDevice->id)
                ->where('refresh_token_hash', hash('sha256', $refreshToken))
                ->where('refresh_expires_at', '>', now())
                ->whereNull('revoked_at')
                ->lockForUpdate()
                ->first();

            if ($session === null) {
                return ['success' => false, 'status' => 'refresh_invalid'];
            }

            $accessToken = $this->newToken();
            $nextRefreshToken = $this->newToken();
            $accessExpiresAt = now()->addSeconds(self::ACCESS_TOKEN_LIFETIME);
            $refreshExpiresAt = now()->addSeconds(self::REFRESH_TOKEN_LIFETIME);

            $session->forceFill([
                'session_token' => $accessToken,
                'expires_at' => $accessExpiresAt,
                'refresh_token_hash' => hash('sha256', $nextRefreshToken),
                'refresh_expires_at' => $refreshExpiresAt,
                'ip_address' => request()->ip(),
                'user_agent' => substr(request()->userAgent() ?? '', 0, 255),
            ])->save();

            return [
                'success' => true,
                'session_token' => $accessToken,
                'access_expires_at' => $accessExpiresAt->toIso8601String(),
                'refresh_token' => $nextRefreshToken,
                'refresh_expires_at' => $refreshExpiresAt->toIso8601String(),
                'user_id' => $session->user_id,
            ];
        });
    }

    public function logout(string $sessionToken): void
    {
        $session = Session::query()->where('session_token', $sessionToken)->first();
        if ($session === null) {
            return;
        }

        if ($session->desktop_device_id !== null) {
            $session->forceFill([
                'revoked_at' => now(),
                'revocation_reason' => 'user_logout',
                'refresh_token_hash' => null,
                'refresh_expires_at' => null,
            ])->save();
        } else {
            $session->delete();
        }

        SessionFacade::flush();
    }

    public function revokeDesktopSession(DesktopDevice $desktopDevice, string $refreshToken, string $reason): bool
    {
        $session = Session::query()
            ->where('desktop_device_id', $desktopDevice->id)
            ->where('refresh_token_hash', hash('sha256', $refreshToken))
            ->whereNull('revoked_at')
            ->first();

        if ($session === null) {
            return false;
        }

        $session->forceFill([
            'revoked_at' => now(),
            'revocation_reason' => Str::limit($reason, 120, ''),
            'refresh_token_hash' => null,
            'refresh_expires_at' => null,
        ])->save();

        return true;
    }

    public function checkSession(?string $sessionToken = null): ?User
    {
        $sessionToken ??= SessionFacade::get('session_token');
        if (! $sessionToken) {
            return null;
        }

        $session = Session::query()
            ->where('session_token', $sessionToken)
            ->where('expires_at', '>', now())
            ->whereNull('revoked_at')
            ->with(['user', 'user.roleRelation'])
            ->first();

        if ($session?->user) {
            $permissions = PermissionService::loadPermissions($session->user->role_id);
            SessionFacade::put('permissions', $permissions);
        }

        return $session?->user;
    }

    private function createSession(User $user, ?DesktopDevice $desktopDevice): array
    {
        $accessToken = $this->newToken();
        $accessExpiresAt = now()->addSeconds($desktopDevice ? self::ACCESS_TOKEN_LIFETIME : 3600);
        $refreshToken = $desktopDevice ? $this->newToken() : null;
        $refreshExpiresAt = $desktopDevice ? now()->addSeconds(self::REFRESH_TOKEN_LIFETIME) : null;

        Session::query()->create([
            'user_id' => $user->id,
            'desktop_device_id' => $desktopDevice?->id,
            'session_token' => $accessToken,
            'refresh_token_hash' => $refreshToken ? hash('sha256', $refreshToken) : null,
            'expires_at' => $accessExpiresAt,
            'refresh_expires_at' => $refreshExpiresAt,
            'ip_address' => request()->ip(),
            'user_agent' => substr(request()->userAgent() ?? '', 0, 255),
        ]);

        $permissions = PermissionService::loadPermissions($user->role_id);
        SessionFacade::put([
            'user_id' => $user->id,
            'session_token' => $accessToken,
            'role_id' => $user->role_id,
            'role_key' => $user->roleRelation?->role_key ?? $user->role ?? 'cashier',
            'permissions' => $permissions,
        ]);

        return [
            'session_token' => $accessToken,
            'access_expires_at' => $accessExpiresAt->toIso8601String(),
            'refresh_token' => $refreshToken,
            'refresh_expires_at' => $refreshExpiresAt?->toIso8601String(),
        ];
    }

    private function newToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    private function checkThrottle(string $username): array
    {
        $attempt = LoginAttempt::query()->where('username', $username)->first();
        if ($attempt === null || ! $attempt->locked_until || ! Carbon::parse($attempt->locked_until)->isFuture()) {
            return ['locked' => false];
        }

        return [
            'locked' => true,
            'wait_time' => Carbon::parse($attempt->locked_until)->diffInSeconds(now()),
        ];
    }

    private function recordFailedAttempt(string $username): void
    {
        $attempt = LoginAttempt::query()->where('username', $username)->first();
        if ($attempt === null) {
            LoginAttempt::query()->create(['username' => $username, 'attempts' => 1, 'last_attempt' => now()]);

            return;
        }

        $attempts = $attempt->attempts + 1;
        $values = ['attempts' => $attempts, 'last_attempt' => now()];
        if ($attempts >= self::MAX_LOGIN_ATTEMPTS) {
            $values['locked_until'] = now()->addSeconds(self::THROTTLE_BASE_TIME * ($attempts - self::MAX_LOGIN_ATTEMPTS + 1));
        }
        $attempt->update($values);
    }

    private function clearFailedAttempts(string $username): void
    {
        LoginAttempt::query()->where('username', $username)->delete();
    }
}

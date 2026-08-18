<?php

namespace App\Providers;

use App\Domains\Commercial\SalesLifecycle\Models\Invoice;
use App\Domains\EnterpriseCore\DesktopDistribution\Models\DesktopDistributionAuditEvent;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\HumanCapital\PayrollBenefits\Services\SalaryCalculatorInterface;
use App\Domains\HumanCapital\PayrollBenefits\Services\SalaryCalculatorService;
use App\Domains\SupplyChain\Procurement\Models\Purchase;
use App\Policies\InvoicePolicy;
use App\Policies\JournalVoucherPolicy;
use App\Policies\PurchasePolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind SalaryCalculator interface to implementation
        $this->app->bind(SalaryCalculatorInterface::class, SalaryCalculatorService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Database\Eloquent\Factories\Factory::guessFactoryNamesUsing(function (string $modelName) {
            return 'Database\\Factories\\'.class_basename($modelName).'Factory';
        });

        \Illuminate\Support\Facades\URL::resolveMissingNamedRoutesUsing(function (string $name, array $parameters, bool $absolute) {
            if (str_starts_with($name, 'api.')) {
                $v2Name = 'v2.'.substr($name, 4);
                if (\Illuminate\Support\Facades\Route::has($v2Name)) {
                    return route($v2Name, $parameters, $absolute);
                }
            }

            return null;
        });

        $this->configureRateLimiting();

        // Register policies for resource-level authorization
        Gate::policy(Invoice::class, InvoicePolicy::class);
        Gate::policy(GeneralLedger::class, JournalVoucherPolicy::class);
        Gate::policy(Purchase::class, PurchasePolicy::class);

        // Grant all permissions to admin users, and check specific permissions for others
        Gate::before(function ($user, $ability, $args = []) {
            // Admin always has access
            if ($user->roleRelation?->role_key === 'admin') {
                return true;
            }

            // Determine module and action
            $module = $ability;
            $action = $args[0] ?? 'view';

            if (str_contains($ability, '.')) {
                $parts = explode('.', $ability, 2);
                if (count($parts) === 2) {
                    [$module, $action] = $parts;
                }
            }

            // Map policy actions to permission columns
            $actionMap = [
                'view' => 'view',
                'create' => 'create',
                'update' => 'edit',
                'edit' => 'edit',
                'delete' => 'delete',
            ];

            if (isset($actionMap[$action])) {
                $mappedAction = $actionMap[$action];
                $permissions = \App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService::loadPermissions($user->role_id);

                if (isset($permissions[$module][$mappedAction])) {
                    return (bool) $permissions[$module][$mappedAction];
                }

                // Also check wildcard permission if set in PermissionService
                if (isset($permissions['*'][$mappedAction])) {
                    return (bool) $permissions['*'][$mappedAction];
                }
            }

            return null;
        });
    }

    /**
     * Configure tiered rate limiting for the API.
     *
     * Tier Design (per authenticated user, per minute):
     *   api          – 120/min – General reads (GET index/show)
     *   api-write    –  30/min – Standard mutations (POST/PUT)
     *   api-sensitive –  10/min – Financial & payroll mutations
     *   api-critical  –   5/min – GL posting, bulk operations, fiscal close
     *   api-delete   –  10/min – Destructive operations
     *   api-export   –   5/min – Report generation, data exports
     *   api-auth     –   5/min – Login attempts (by IP)
     */
    private function configureRateLimiting(): void
    {
        // General read operations — generous for UI responsiveness
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(120)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Too many requests. Please slow down.',
                        'retry_after' => $headers['Retry-After'] ?? 60,
                    ], 429, $headers);
                });
        });

        // Standard write operations (create, update)
        RateLimiter::for('api-write', function (Request $request) {
            return Limit::perMinute(30)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Write rate limit exceeded. Please wait before submitting again.',
                        'retry_after' => $headers['Retry-After'] ?? 60,
                    ], 429, $headers);
                });
        });

        // Sensitive financial & payroll operations
        RateLimiter::for('api-sensitive', function (Request $request) {
            return Limit::perMinute(10)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Rate limit exceeded for sensitive operations.',
                        'retry_after' => $headers['Retry-After'] ?? 60,
                    ], 429, $headers);
                });
        });

        // Critical operations — GL posting, bulk updates, fiscal period close
        RateLimiter::for('api-critical', function (Request $request) {
            return Limit::perMinute(5)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Critical operation rate limit reached. This action is throttled for safety.',
                        'retry_after' => $headers['Retry-After'] ?? 60,
                    ], 429, $headers);
                });
        });

        // Delete operations
        RateLimiter::for('api-delete', function (Request $request) {
            return Limit::perMinute(10)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Delete rate limit exceeded.',
                        'retry_after' => $headers['Retry-After'] ?? 60,
                    ], 429, $headers);
                });
        });

        // Report and export operations (often heavy queries)
        RateLimiter::for('api-export', function (Request $request) {
            return Limit::perMinute(5)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Report generation rate limit reached. Please wait.',
                        'retry_after' => $headers['Retry-After'] ?? 60,
                    ], 429, $headers);
                });
        });

        // Desktop bootstrap is intentionally narrow but public, keyed by network origin.
        RateLimiter::for('desktop-bootstrap', function (Request $request) {
            return Limit::perMinute(30)
                ->by('desktop-bootstrap:'.$request->ip())
                ->response(function (Request $request, array $headers) {
                    DesktopDistributionAuditEvent::query()->create([
                        'event_type' => 'desktop.bootstrap',
                        'outcome' => 'rate_limited',
                        'ip_address' => $request->ip(),
                    ]);

                    return response()->json([
                        'success' => false,
                        'message' => 'Too many desktop bootstrap requests. Please wait before trying again.',
                        'retry_after' => $headers['Retry-After'] ?? 60,
                    ], 429, $headers);
                });
        });

        // Enrollment consumes one-time evidence and must remain resistant to probing.
        RateLimiter::for('desktop-enroll', function (Request $request) {
            return Limit::perMinute(5)
                ->by('desktop-enroll:'.$request->ip())
                ->response(function (Request $request, array $headers) {
                    DesktopDistributionAuditEvent::query()->create([
                        'event_type' => 'desktop.enrollment',
                        'outcome' => 'rate_limited',
                        'ip_address' => $request->ip(),
                    ]);

                    return response()->json([
                        'success' => false,
                        'message' => 'Too many desktop enrollment attempts. Please wait before trying again.',
                        'retry_after' => $headers['Retry-After'] ?? 60,
                    ], 429, $headers);
                });
        });

        // Policy is authenticated by the device token and keyed by its presented identity.
        RateLimiter::for('desktop-policy', function (Request $request) {
            return Limit::perMinute(60)
                ->by('desktop-policy:'.($request->header('X-Accore-Device-Id') ?: $request->ip()))
                ->response(function (Request $request, array $headers) {
                    DesktopDistributionAuditEvent::query()->create([
                        'event_type' => 'desktop.policy',
                        'outcome' => 'rate_limited',
                        'ip_address' => $request->ip(),
                        'context' => ['device_id' => $request->header('X-Accore-Device-Id')],
                    ]);

                    return response()->json([
                        'success' => false,
                        'message' => 'Too many desktop policy requests. Please wait before trying again.',
                        'retry_after' => $headers['Retry-After'] ?? 60,
                    ], 429, $headers);
                });
        });

        // Authentication — by IP, strict
        RateLimiter::for('api-auth', function (Request $request) {
            return Limit::perMinute(5)
                ->by($request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Too many login attempts. Please try again later.',
                        'retry_after' => $headers['Retry-After'] ?? 60,
                    ], 429, $headers);
                });
        });
    }
}

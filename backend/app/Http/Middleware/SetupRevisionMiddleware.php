<?php

namespace App\Http\Middleware;

use Closure;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OrgBlueprint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;
use UnexpectedValueException;

/**
 * Serializes setup-relevant reads and writes against a settings-backed revision.
 * All participating mutations must use this middleware so the shared row is the
 * compare-and-advance mutex, not merely a response token.
 */
class SetupRevisionMiddleware
{
    private const SETTING_KEY = 'setup.revision';

    public function handle(Request $request, Closure $next, string $mode = 'read'): Response
    {
        if (!in_array($mode, ['read', 'write', 'blueprint'], true)) {
            throw new UnexpectedValueException('Unsupported setup revision middleware mode.');
        }

        return DB::transaction(function () use ($request, $next, $mode): Response {
            $currentRevision = $this->lockCurrentRevision();
            $isWrite = $mode !== 'read';

            if ($isWrite) {
                $submittedRevision = $this->parseIfMatch($request->header('If-Match'));

                if ($submittedRevision === null) {
                    return $this->preconditionResponse(
                        428,
                        'setup_revision_required',
                        'A current setup revision is required. Reload setup state before retrying.',
                        $currentRevision,
                    );
                }

                if ($submittedRevision !== $currentRevision) {
                    return $this->preconditionResponse(
                        409,
                        'setup_state_conflict',
                        'Setup state changed after it was loaded. Reload the current state before reconciling this draft.',
                        $currentRevision,
                    );
                }
            }

            if ($mode === 'blueprint') {
                $blueprintConflict = $this->blueprintPreconditionConflict($request, $currentRevision);
                if ($blueprintConflict !== null) {
                    return $blueprintConflict;
                }
            }

            $response = $next($request);
            $revisionForResponse = $currentRevision;

            if ($isWrite && $response->getStatusCode() < 400) {
                $revisionForResponse = $currentRevision + 1;
                DB::table('settings')
                    ->where('setting_key', self::SETTING_KEY)
                    ->update([
                        'setting_value' => (string) $revisionForResponse,
                        'updated_at' => now(),
                    ]);
            }

            $response->headers->set('X-Setup-Revision', (string) $revisionForResponse);
            if ($response instanceof JsonResponse) {
                $payload = $response->getData(true);
                if (is_array($payload)) {
                    if ($isWrite && $response->getStatusCode() >= 400) {
                        $payload['current_revision'] = $currentRevision;
                    } else {
                        $payload['setup_revision'] = $revisionForResponse;
                    }
                    $response->setData($payload);
                }
            }

            return $response;
        });
    }

    private function lockCurrentRevision(): int
    {
        DB::table('settings')->insertOrIgnore([
            'setting_key' => self::SETTING_KEY,
            'setting_value' => '1',
            'updated_at' => now(),
        ]);

        $row = DB::table('settings')
            ->where('setting_key', self::SETTING_KEY)
            ->lockForUpdate()
            ->first();

        $revision = filter_var($row?->setting_value, FILTER_VALIDATE_INT);
        if ($revision === false || $revision === null || $revision < 1) {
            throw new UnexpectedValueException('The persisted setup revision is invalid.');
        }

        return $revision;
    }

    private function parseIfMatch(?string $value): ?int
    {
        if ($value === null) {
            return null;
        }

        $value = trim($value);
        if (preg_match('/^(?:W\/)?"?([1-9][0-9]*)"?$/', $value, $matches) !== 1) {
            return null;
        }

        $revision = filter_var($matches[1], FILTER_VALIDATE_INT);
        return $revision === false ? null : $revision;
    }

    private function blueprintPreconditionConflict(Request $request, int $currentRevision): ?JsonResponse
    {
        $blueprintUuid = $request->route('uuid');
        $blueprint = OrgBlueprint::query()
            ->where('blueprint_uuid', $blueprintUuid)
            ->lockForUpdate()
            ->first();

        // Let the controller return its established not-found response.
        if ($blueprint === null) {
            return null;
        }

        $currentBlueprintRevision = $blueprint->revisionToken();
        $submittedBlueprintRevision = $request->input('blueprint_revision');

        if (!is_string($submittedBlueprintRevision) || $submittedBlueprintRevision === '') {
            return $this->preconditionResponse(
                428,
                'setup_blueprint_revision_required',
                'The staged blueprint revision is required before publication.',
                $currentRevision,
                ['current_blueprint_revision' => $currentBlueprintRevision],
            );
        }

        if (!hash_equals($currentBlueprintRevision, $submittedBlueprintRevision)) {
            return $this->preconditionResponse(
                409,
                'setup_state_conflict',
                'The staged blueprint changed after it was reviewed. Reload and review the current blueprint before publishing.',
                $currentRevision,
                [
                    'conflict_scope' => 'blueprint',
                    'current_blueprint_revision' => $currentBlueprintRevision,
                ],
            );
        }

        return null;
    }

    private function preconditionResponse(int $status, string $code, string $message, int $currentRevision, array $extra = []): JsonResponse
    {
        return response()->json(array_merge([
            'success' => false,
            'code' => $code,
            'message' => $message,
            'current_revision' => $currentRevision,
            'reload_required' => true,
        ], $extra), $status, ['X-Setup-Revision' => (string) $currentRevision]);
    }
}

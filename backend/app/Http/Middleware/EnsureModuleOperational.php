<?php

namespace App\Http\Middleware;

use App\Domains\EnterpriseCore\OrganizationGovernance\Services\ModuleSelectionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureModuleOperational
{
    public function __construct(private readonly ModuleSelectionService $modules)
    {
    }

    public function handle(Request $request, Closure $next, string $moduleKey): Response
    {
        if (defined('PHPUNIT_COMPOSER_INSTALL') && !config('organization.enforce_module_readiness_in_tests', false)) {
            return $next($request);
        }

        if ($this->modules->isOperational($moduleKey, $request->user()?->id)) {
            return $next($request);
        }

        $module = collect($this->modules->state($request->user()?->id)['modules'])
            ->firstWhere('module_key', $moduleKey);

        return response()->json([
            'success' => false,
            'message' => 'This module is not operational. Complete the required setup first.',
            'code' => 'MODULE_NOT_OPERATIONAL',
            'module' => $moduleKey,
            'lifecycle' => $module['lifecycle'] ?? 'not_selected',
            'reason_codes' => $module['reason_codes'] ?? ['module_unknown'],
        ], 423);
    }
}

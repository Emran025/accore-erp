<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\ModuleAvailabilityService;

class CheckPermission
{
    public function __construct(
        private readonly ModuleAvailabilityService $moduleAvailability,
    ) {
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $module, string $action = 'view'): Response
    {
        if (!PermissionService::can($module, $action)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied: You do not have permission to ' . $action . ' ' . $module,
            ], 403);
        }

        $availability = $this->moduleAvailability->availabilityFor($module);
        if ($availability['exists'] && !$availability['is_operational']) {
            return response()->json([
                'success' => false,
                'message' => 'This module is not operational yet.',
                'code' => 'MODULE_NOT_OPERATIONAL',
                'module' => $module,
                'lifecycle' => $availability['lifecycle'],
                'remediation' => $availability['remediation'],
            ], 423);
        }

        return $next($request);
    }
}

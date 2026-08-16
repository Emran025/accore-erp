<?php

namespace App\Http\Middleware;

use App\Domains\EnterpriseCore\OrganizationGovernance\Services\ModuleAvailabilityService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureModuleOperational
{
    public function __construct(
        private readonly ModuleAvailabilityService $moduleAvailability,
    ) {}

    /**
     * Deny operational API access unless the module has been explicitly
     * activated. Permission middleware remains responsible for RBAC; this
     * middleware protects setup and organizational readiness boundaries.
     */
    public function handle(Request $request, Closure $next, string $moduleKey): Response
    {
        $availability = $this->moduleAvailability->availabilityFor($moduleKey);

        if (! $availability['is_operational']) {
            return response()->json([
                'success' => false,
                'message' => 'This module is not operational yet.',
                'code' => 'MODULE_NOT_OPERATIONAL',
                'module' => $moduleKey,
                'lifecycle' => $availability['lifecycle'],
                'remediation' => $availability['remediation'],
            ], 423);
        }

        return $next($request);
    }
}

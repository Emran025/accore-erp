<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\OrganizationGovernance;

use App\Domains\EnterpriseCore\OrganizationGovernance\Services\ModuleSelectionService;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SetupStateController extends Controller
{
    use BaseApiController;

    public function __construct(private readonly ModuleSelectionService $modules)
    {
    }

    public function show(Request $request): JsonResponse
    {
        return $this->successResponse([
            'data' => $this->modules->state($request->user()?->id),
        ]);
    }

    public function selectModules(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'module_keys' => ['present', 'array'],
            'module_keys.*' => ['string', 'distinct'],
        ]);

        return $this->successResponse([
            'data' => $this->modules->select($validated['module_keys'], $request->user()?->id),
        ], 'Module selection saved.');
    }

    public function activateSelected(Request $request): JsonResponse
    {
        $activation = $this->modules->activateSelected($request->user()?->id);

        return $this->successResponse([
            'data' => [
                'activation' => $activation,
                'state' => $this->modules->state($request->user()?->id),
            ],
        ], 'Selected modules evaluated for activation.');
    }
}

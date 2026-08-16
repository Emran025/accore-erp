<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\OrganizationGovernance;

use App\Domains\Commercial\SalesLifecycle\Models\PosTerminal;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OperatingContext;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OperatingContextService;
use App\Domains\SupplyChain\Inventory\Models\Warehouse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\ConfigureOperatingContextRequest;
use App\Http\Resources\EnterpriseCore\OrganizationGovernance\OperatingContextResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OperatingContextController extends Controller
{
    use BaseApiController;

    public function readiness(Request $request, OperatingContextService $service): JsonResponse
    {
        $readiness = $service->readiness($request->user()?->id);
        $context = $readiness['context'];

        return $this->successResponse(['data' => [
            'ready' => $readiness['ready'],
            'status' => $readiness['status'],
            'checks' => $readiness['checks'],
            'missing' => $readiness['missing'],
            'next_action' => $readiness['next_action'],
            'structural_readiness' => $readiness['structural_readiness'],
            'context' => $context ? (new OperatingContextResource($context))->resolve($request) : null,
        ]]);
    }

    public function configure(ConfigureOperatingContextRequest $request, OperatingContextService $service): JsonResponse
    {
        $context = $service->configure($request->validated(), $request->user()?->id);

        return $this->successResponse(
            new OperatingContextResource($context),
            'Operating context configured successfully.',
            201
        );
    }

    public function select(Request $request, int $id, OperatingContextService $service): JsonResponse
    {
        $context = $service->setDefaultContext($id, $request->user()?->id);

        return $this->successResponse(
            new OperatingContextResource($context),
            'Operating context selected successfully.'
        );
    }

    public function warehouses(Request $request): JsonResponse
    {
        $warehouses = Warehouse::query()
            ->when($request->boolean('active_only'), fn ($query) => $query->where('is_active', true)->where('status', 'active'))
            ->orderBy('code')
            ->get()
            ->map(fn (Warehouse $warehouse) => [
                'id' => $warehouse->id,
                'code' => $warehouse->code,
                'name' => $warehouse->name,
                'name_en' => $warehouse->name_en,
                'org_node_uuid' => $warehouse->org_node_uuid,
                'cost_center_id' => $warehouse->cost_center_id,
                'profit_center_id' => $warehouse->profit_center_id,
                'status' => $warehouse->status,
                'is_active' => (bool) $warehouse->is_active,
            ]);

        return $this->successResponse($warehouses);
    }

    public function posTerminals(Request $request): JsonResponse
    {
        $terminals = PosTerminal::query()
            ->when($request->boolean('active_only'), fn ($query) => $query->where('is_active', true)->where('status', 'active'))
            ->when($request->filled('warehouse_id'), fn ($query) => $query->where('warehouse_id', $request->integer('warehouse_id')))
            ->orderBy('code')
            ->get()
            ->map(fn (PosTerminal $terminal) => [
                'id' => $terminal->id,
                'code' => $terminal->code,
                'name' => $terminal->name,
                'name_en' => $terminal->name_en,
                'warehouse_id' => $terminal->warehouse_id,
                'cost_center_id' => $terminal->cost_center_id,
                'profit_center_id' => $terminal->profit_center_id,
                'status' => $terminal->status,
                'is_active' => (bool) $terminal->is_active,
            ]);

        return $this->successResponse($terminals);
    }
}

<?php
namespace App\Domains\EnterpriseCore\OrgIntegration\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\OrgIntegration\Services\OrgIntegrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BulkSyncOrgAction extends Action
{
    public function __construct(private readonly Request $request, private readonly OrgIntegrationService $service) {}

    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'targets' => 'required|array',
            'targets.*' => 'in:cost_centers,profit_centers,job_titles,nodes_to_tables',
        ]);

        $results = $this->service->bulkSync($validated['targets']);
        return $this->successResponse(['results' => $results], 'Bulk synchronization completed');
    }
}

<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\JobTitle;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgIntegrationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class UpdateJobTitleAction
{
    public function __construct(
        private readonly OrgIntegrationService $orgIntegration,
    ) {}

    public function execute(int|string $id, array $data): Collection
    {
        $title = JobTitle::findOrFail($id);

        return DB::transaction(function () use ($title, $data) {
            $title->update($data);

            $posUpdated = $this->orgIntegration->syncJobTitleToPositions($title->fresh());
            $empUpdated = $this->orgIntegration->syncJobTitleToEmployees($title->fresh());

            return collect([
                'title' => $title->load('department'),
                'positions_synced' => $posUpdated,
                'employees_synced' => $empUpdated,
            ]);
        });
    }
}

<?php

namespace App\Domains\EnterpriseCore\OrgIntegration\Actions;

use App\Domains\EnterpriseCore\OrgIntegration\Services\OrgIntegrationService;

class GetIntegrationIssuesAction
{
    public function __construct(private readonly OrgIntegrationService $service) {}

    public function execute(): array
    {
        $issues = $this->service->getIntegrationIssues();
        
        return [
            'issues'       => $issues,
            'total_issues' => count($issues),
            'by_type'      => [
                'errors'   => collect($issues)->where('type', 'ERROR')->count(),
                'warnings' => collect($issues)->where('type', 'WARNING')->count(),
                'info'     => collect($issues)->where('type', 'INFO')->count(),
            ],
        ];
    }
}

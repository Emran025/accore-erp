<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureLink;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\EffectiveDatingService;

class RestructureOrgLinkAction
{
    public function __construct(
        private readonly EffectiveDatingService $effectiveDating
    ) {}

    /**
     * @param array<string, mixed> $data
     * @return StructureLink
     */
    public function execute(array $data): StructureLink
    {
        $planeType = $data['plane_type'] ?? 'OPERATIONAL_HIERARCHY';
        $effectiveDate = $data['effective_date'] ?? now()->toDateString();

        return $this->effectiveDating->restructureLink(
            sourceUuid: $data['source_node_uuid'],
            newTargetUuid: $data['target_node_uuid'],
            planeType: $planeType,
            effectiveDate: $effectiveDate,
            linkType: $data['link_type'] ?? 'line_management',
            reason: $data['reason'] ?? null
        );
    }
}

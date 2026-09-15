<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Services;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureLink;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
use App\Domains\HumanCapital\WorkforceAdmin\Models\OrgChangeHistory;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Temporal Versioning & Effective Dating Service for Organizational Restructuring.
 * Safely manages time-slice mutations on structure links and guarantees historical integrity.
 */
class EffectiveDatingService
{
    public function __construct(
        private readonly OrgNodeClosureService $closureService
    ) {}

    /**
     * Restructure a link effective on a specific date.
     * Preserves historical reporting while establishing the future or current reporting line.
     *
     * @throws ValidationException
     */
    public function restructureLink(
        string $sourceUuid,
        string $newTargetUuid,
        string $planeType = 'OPERATIONAL_HIERARCHY',
        Carbon|string $effectiveDate = null,
        ?string $linkType = 'line_management',
        ?string $reason = null
    ): StructureLink {
        $sourceNode = StructureNode::where('node_uuid', $sourceUuid)->first();
        if (!$sourceNode) {
            throw ValidationException::withMessages([
                'source_node_uuid' => "Source node [{$sourceUuid}] not found.",
            ]);
        }

        $targetNode = StructureNode::where('node_uuid', $newTargetUuid)->first();
        if (!$targetNode) {
            throw ValidationException::withMessages([
                'target_node_uuid' => "Target node [{$newTargetUuid}] not found.",
            ]);
        }

        if ($sourceUuid === $newTargetUuid) {
            throw ValidationException::withMessages([
                'target_node_uuid' => "A unit cannot report to itself.",
            ]);
        }

        // Cycle detection: sourceNode cannot be an ancestor of newTargetNode in this plane
        $descendants = $this->closureService->getDescendants($sourceUuid, $planeType);
        if (in_array($newTargetUuid, $descendants, true)) {
            throw ValidationException::withMessages([
                'target_node_uuid' => "Cycle detected: Target [{" . $targetNode->name_en ?? $newTargetUuid . "}] is already a descendant of Source [{" . $sourceNode->name_en ?? $sourceUuid . "}]",
            ]);
        }

        $date = $effectiveDate ? Carbon::parse($effectiveDate) : Carbon::today();
        $dateStr = $date->toDateString();

        return DB::transaction(function () use ($sourceUuid, $newTargetUuid, $planeType, $linkType, $date, $dateStr, $reason) {
            // 1. Find currently active link for this source in the given plane
            $existingLink = StructureLink::where('source_node_uuid', $sourceUuid)
                ->where('plane_type', $planeType)
                ->where(function ($q) use ($dateStr) {
                    $q->whereNull('valid_to')
                        ->orWhere('valid_to', '>=', $dateStr);
                })
                ->orderByDesc('id')
                ->first();

            $subDay = $date->copy()->subDay()->toDateString();

            if ($existingLink) {
                // If existing link started on or after effective date, update it directly or cap it
                if ($existingLink->valid_from && $existingLink->valid_from->toDateString() >= $dateStr) {
                    $existingLink->update([
                        'valid_to' => $dateStr,
                    ]);
                } else {
                    $existingLink->update([
                        'valid_to' => $subDay,
                    ]);
                }
            }

            // 2. Create the new link with effective date
            $newLink = StructureLink::create([
                'source_node_uuid' => $sourceUuid,
                'target_node_uuid' => $newTargetUuid,
                'plane_type'       => $planeType,
                'link_type'        => $linkType ?? 'line_management',
                'priority'         => 0,
                'valid_from'       => $dateStr,
                'valid_to'         => null,
                'created_by'       => auth()->id(),
            ]);

            // 3. Rebuild Transitive Closures for the affected plane
            $this->closureService->rebuildClosures($planeType);

            // 4. Record Change History
            $this->recordRestructureHistory(
                sourceUuid: $sourceUuid,
                oldTargetUuid: $existingLink?->target_node_uuid,
                newTargetUuid: $newTargetUuid,
                planeType: $planeType,
                effectiveDate: $dateStr,
                reason: $reason
            );

            return $newLink->load(['sourceNode', 'targetNode']);
        });
    }

    /**
     * Close an active link at a designated effective date.
     */
    public function closeLink(
        int $linkId,
        Carbon|string $effectiveDate = null,
        ?string $reason = null
    ): StructureLink {
        $link = StructureLink::findOrFail($linkId);
        $date = $effectiveDate ? Carbon::parse($effectiveDate) : Carbon::today();
        $dateStr = $date->toDateString();

        return DB::transaction(function () use ($link, $dateStr, $reason) {
            $oldValues = $link->toArray();

            $link->update([
                'valid_to' => $dateStr,
            ]);

            $this->closureService->rebuildClosures($link->plane_type);

            if (class_exists(OrgChangeHistory::class)) {
                try {
                    OrgChangeHistory::create([
                        'entity_type' => 'link_closure',
                        'entity_id'   => (string) $link->id,
                        'change_type' => 'closed',
                        'old_values'  => $oldValues,
                        'new_values'  => $link->toArray(),
                        'reason'      => $reason ?? "Closed effective on {$dateStr}",
                        'changed_by'  => auth()->id(),
                        'changed_at'  => now(),
                    ]);
                } catch (\Throwable) {
                    // Fail gracefully if table or auth is optional
                }
            }

            return $link;
        });
    }

    /**
     * Convenience method for hierarchical re-parenting.
     */
    public function reassignNode(
        string $nodeUuid,
        string $newParentUuid,
        Carbon|string $effectiveDate = null,
        ?string $reason = null
    ): StructureLink {
        return $this->restructureLink(
            sourceUuid: $nodeUuid,
            newTargetUuid: $newParentUuid,
            planeType: 'OPERATIONAL_HIERARCHY',
            effectiveDate: $effectiveDate,
            linkType: 'line_management',
            reason: $reason
        );
    }

    /**
     * Record restructure audit record.
     */
    private function recordRestructureHistory(
        string $sourceUuid,
        ?string $oldTargetUuid,
        string $newTargetUuid,
        string $planeType,
        string $effectiveDate,
        ?string $reason
    ): void {
        if (!class_exists(OrgChangeHistory::class)) {
            return;
        }

        try {
            OrgChangeHistory::create([
                'entity_type' => 'link_restructure',
                'entity_id'   => $sourceUuid,
                'change_type' => 'restructured',
                'old_values'  => [
                    'target_node_uuid' => $oldTargetUuid,
                    'plane_type'       => $planeType,
                ],
                'new_values'  => [
                    'target_node_uuid' => $newTargetUuid,
                    'plane_type'       => $planeType,
                    'effective_date'   => $effectiveDate,
                ],
                'reason'      => $reason ?? "Restructured {$planeType} reporting to {$newTargetUuid} effective {$effectiveDate}",
                'changed_by'  => auth()->id(),
                'changed_at'  => now(),
            ]);
        } catch (\Throwable) {
            // Non-critical audit failure
        }
    }
}

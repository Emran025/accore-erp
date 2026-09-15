<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Services;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OrgNodeClosure;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureLink;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
use Illuminate\Support\Facades\DB;

/**
 * High-performance transitive closure service for organizational hierarchies.
 * Computes and caches multi-level ancestor and descendant relationships.
 */
class OrgNodeClosureService
{
    /**
     * Rebuild all transitive closures for a specific plane or all planes.
     */
    public function rebuildClosures(?string $planeType = null): void
    {
        DB::transaction(function () use ($planeType) {
            $query = OrgNodeClosure::query();
            if ($planeType !== null) {
                $query->where('plane_type', $planeType);
            }
            $query->delete();

            $planes = $planeType !== null ? [$planeType] : [
                'OPERATIONAL_HIERARCHY',
                'LEGAL_OWNERSHIP',
                'GEOGRAPHIC_CONTAINMENT',
                'FUNCTIONAL_MATRIX',
                'PROJECT_ASSIGNMENT',
                'FINANCIAL_ROLLUP',
            ];

            foreach ($planes as $plane) {
                $this->rebuildPlane($plane);
            }
        });
    }

    /**
     * Rebuild closures for a single relationship plane.
     */
    public function rebuildPlane(string $planeType): void
    {
        // 1. Self-closure (depth 0) for every active node
        $nodes = StructureNode::where('status', 'active')->pluck('node_uuid');
        $now = now()->toDateString();

        $selfRows = [];
        foreach ($nodes as $uuid) {
            $selfRows[] = [
                'plane_type'      => $planeType,
                'ancestor_uuid'   => $uuid,
                'descendant_uuid' => $uuid,
                'depth'           => 0,
                'valid_from'      => $now,
                'valid_to'        => null,
                'created_at'      => now(),
                'updated_at'      => now(),
            ];
        }

        foreach (array_chunk($selfRows, 500) as $chunk) {
            OrgNodeClosure::insert($chunk);
        }

        // 2. Direct links (depth 1)
        // In current topology: target is parent (ancestor), source is child (descendant)
        $links = StructureLink::activeOnDate($now)
            ->where('plane_type', $planeType)
            ->get(['source_node_uuid', 'target_node_uuid', 'valid_from', 'valid_to']);

        $depth1Rows = [];
        foreach ($links as $link) {
            $depth1Rows[] = [
                'plane_type'      => $planeType,
                'ancestor_uuid'   => $link->target_node_uuid,
                'descendant_uuid' => $link->source_node_uuid,
                'depth'           => 1,
                'valid_from'      => $link->valid_from ? $link->valid_from->toDateString() : $now,
                'valid_to'        => $link->valid_to ? $link->valid_to->toDateString() : null,
                'created_at'      => now(),
                'updated_at'      => now(),
            ];
        }

        foreach (array_chunk($depth1Rows, 500) as $chunk) {
            OrgNodeClosure::insert($chunk);
        }

        // 3. Transitive propagation (depth 2+)
        $depth = 1;
        while (true) {
            $added = DB::insert("
                INSERT INTO org_node_closures (plane_type, ancestor_uuid, descendant_uuid, depth, valid_from, valid_to, created_at, updated_at)
                SELECT 
                    a.plane_type,
                    a.ancestor_uuid,
                    b.descendant_uuid,
                    a.depth + b.depth AS depth,
                    a.valid_from,
                    a.valid_to,
                    NOW(),
                    NOW()
                FROM org_node_closures a
                JOIN org_node_closures b 
                    ON a.descendant_uuid = b.ancestor_uuid
                   AND a.plane_type = b.plane_type
                WHERE a.plane_type = ?
                  AND a.depth = ?
                  AND b.depth = 1
                  AND NOT EXISTS (
                      SELECT 1 FROM org_node_closures existing
                      WHERE existing.plane_type = a.plane_type
                        AND existing.ancestor_uuid = a.ancestor_uuid
                        AND existing.descendant_uuid = b.descendant_uuid
                  )
            ", [$planeType, $depth]);

            if ($added === 0) {
                break;
            }

            $depth++;
            if ($depth > 20) {
                // Safeguard against unbounded cycles
                break;
            }
        }
    }

    /**
     * Get all ancestor UUIDs for a given node.
     * @return array<string>
     */
    public function getAncestors(string $nodeUuid, string $planeType = 'OPERATIONAL_HIERARCHY'): array
    {
        return OrgNodeClosure::plane($planeType)
            ->activeOnDate()
            ->where('descendant_uuid', $nodeUuid)
            ->where('depth', '>', 0)
            ->orderBy('depth')
            ->pluck('ancestor_uuid')
            ->all();
    }

    /**
     * Get all descendant UUIDs for a given node.
     * @return array<string>
     */
    public function getDescendants(string $nodeUuid, string $planeType = 'OPERATIONAL_HIERARCHY'): array
    {
        return OrgNodeClosure::plane($planeType)
            ->activeOnDate()
            ->where('ancestor_uuid', $nodeUuid)
            ->where('depth', '>', 0)
            ->orderBy('depth')
            ->pluck('descendant_uuid')
            ->all();
    }
}

<?php
namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
use Illuminate\Database\Eloquent\Collection;
class ListStructureNodesAction
{
    public function execute(array $filters = []): Collection
    {
        $query = StructureNode::with(['metaType', 'outgoingLinks', 'incomingLinks']);

        if (!empty($filters['node_type_id'])) {
            $query->where('node_type_id', $filters['node_type_id']);
        }
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['level_domain'])) {
            $query->whereHas('metaType', fn($q) => $q->where('level_domain', $filters['level_domain']));
        }
        if (!empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function ($q) use ($term) {
                $q->where('code', 'like', "%{$term}%")
                    ->orWhere('attributes_json->name', 'like', "%{$term}%");
            });
        }

        return $query->orderBy('node_type_id')->orderBy('code')->get();
    }
}

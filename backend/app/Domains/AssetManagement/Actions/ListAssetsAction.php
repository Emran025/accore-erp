<?php
namespace App\Domains\AssetManagement\Actions;
use App\Domains\AssetManagement\Models\Asset;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;
class ListAssetsAction
{
    public function execute(array $filters): array
    {
        PermissionService::requirePermission('assets', 'view');

        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? $filters['limit'] ?? 20)));

        $query = Asset::with('createdBy');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(fn($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%"));
        }

        $total = $query->count();
        $assets = $query->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        $assets->each(fn($asset) => $asset->recorder_name = $asset->createdBy->name ?? null);

        return [
            'data'         => $assets->toArray(),
            'total'        => $total,
            'current_page' => $page,
            'per_page'     => $perPage,
        ];
    }
}

<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Category;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class ListCategoriesAction
{
    public function execute(): array
    {
        PermissionService::requirePermission('products', 'view');
        return Category::orderBy('name')->get()->toArray();
    }
}

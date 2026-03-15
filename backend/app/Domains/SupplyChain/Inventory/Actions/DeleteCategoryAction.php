<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Category;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;

class DeleteCategoryAction
{
    public function execute(int $id): void
    {
        $category = Category::findOrFail($id);
        $oldValues = $category->toArray();
        $category->delete();

        TelescopeService::logOperation('DELETE', 'categories', $id, $oldValues, null);
    }
}

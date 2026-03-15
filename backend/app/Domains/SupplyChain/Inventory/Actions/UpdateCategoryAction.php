<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Category;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;

class UpdateCategoryAction
{
    public function execute(array $data): void
    {
        $category = Category::findOrFail($data['id']);
        $oldValues = $category->toArray();
        $category->update($data);

        TelescopeService::logOperation('UPDATE', 'categories', $category->id, $oldValues, $data);
    }
}

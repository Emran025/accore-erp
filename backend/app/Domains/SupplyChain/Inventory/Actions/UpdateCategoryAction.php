<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Category;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;

class UpdateCategoryAction
{
    public function execute(array $data, ?int $id = null): Category
    {
        $id = $id ?? $data['id'];
        $category = Category::findOrFail($id);
        $oldValues = $category->toArray();
        $category->update($data);

        TelescopeService::logOperation('UPDATE', 'categories', $category->id, $oldValues, $data);

        return $category;
    }
}

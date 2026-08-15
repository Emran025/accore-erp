<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Category;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use App\Support\Localization\LocalizedValue;

class UpdateCategoryAction
{
    public function execute(array $data, ?int $id = null): Category
    {
        $id = $id ?? $data['id'];
        $category = Category::findOrFail($id);
        $oldValues = $category->toArray();
        $data = LocalizedValue::normaliseInput($data, 'name');
        $data = LocalizedValue::normaliseInput($data, 'description');
        $category->update($data);

        TelescopeService::logOperation('UPDATE', 'categories', $category->id, $oldValues, $data);

        return $category;
    }
}

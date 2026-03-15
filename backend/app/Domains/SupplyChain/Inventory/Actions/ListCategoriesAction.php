<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Category;

class ListCategoriesAction
{
    public function execute(): array
    {
        return Category::orderBy('name')->get()->toArray();
    }
}

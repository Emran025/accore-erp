<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Category;
use Illuminate\Database\Eloquent\Collection;
class ListCategoriesAction
{
    public function execute(): Collection
    {
        return Category::orderBy('name')->get();
    }
}

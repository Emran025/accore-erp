<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\SupplyChain\Inventory\Models\Category;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

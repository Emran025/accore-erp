<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\SupplyChain\Inventory\Models\Category;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateCategoryAction
{
    public function execute(array $data): array
    {
        $data['created_by'] = auth()->id() ?? session('user_id');

        $category = Category::create($data);

        TelescopeService::logOperation('CREATE', 'categories', $category->id, null, $data);

        return ['id' => $category->id];
    }
}

<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\SupplyChain\Inventory\Models\Category;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use App\Support\Localization\LocalizedValue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateCategoryAction
{
    public function execute(array $data): Category
    {
        $data = LocalizedValue::normaliseInput($data, 'name');
        $data = LocalizedValue::normaliseInput($data, 'description');
        $data['created_by'] = auth()->id() ?? session('user_id');

        $category = Category::create($data);

        TelescopeService::logOperation('CREATE', 'categories', $category->id, null, $data);

        return $category;
    }
}

<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\SupplyChain\Inventory\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $adminUserId = DB::table('users')->where('role', 'admin')->value('id');

        $categories = [
            ['code' => 'food-staples', 'ar' => 'المواد الغذائية', 'en' => 'Food Staples'],
            ['code' => 'cooking-oils', 'ar' => 'الزيوت', 'en' => 'Cooking Oils'],
            ['code' => 'hot-drinks', 'ar' => 'المشروبات الساخنة', 'en' => 'Hot Drinks'],
            ['code' => 'cold-drinks', 'ar' => 'المشروبات الباردة', 'en' => 'Cold Drinks'],
            ['code' => 'cleaning-paper-goods', 'ar' => 'المنظفات والورقيات', 'en' => 'Cleaning and Paper Goods'],
            ['code' => 'dairy-products', 'ar' => 'الألبان', 'en' => 'Dairy Products'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['catalog_code' => $category['code']],
                [
                    'name' => $category['ar'],
                    'name_ar' => $category['ar'],
                    'name_en' => $category['en'],
                    'description_ar' => 'تصنيف منتجات أساسي في كتالوج المتجر.',
                    'description_en' => 'A core product category in the store catalogue.',
                    'created_by' => $adminUserId,
                ],
            );
        }
    }
}

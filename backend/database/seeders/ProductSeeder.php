<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\SupplyChain\Inventory\Models\Category;
use App\Domains\SupplyChain\Inventory\Models\Product;
use App\Domains\SupplyChain\Inventory\Services\InventoryCostingService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $adminUserId = DB::table('users')->where('role', 'admin')->value('id');
        $categories = Category::query()->pluck('id', 'catalog_code');
        $costingService = app(InventoryCostingService::class);

        $products = [
            ['code' => 'food.basmati-rice.10kg', 'category' => 'food-staples', 'ar' => 'أرز بسمتي 10 كجم', 'en' => 'Basmati Rice 10 kg', 'description_ar' => 'أرز بسمتي درجة أولى', 'description_en' => 'First-grade basmati rice', 'unit_ar' => 'كيس', 'unit_en' => 'Bag', 'sub_ar' => null, 'sub_en' => null, 'price' => 75.00, 'margin' => 10.00, 'stock' => 100, 'cost' => 60.00, 'items' => 1],
            ['code' => 'food.fine-sugar.5kg', 'category' => 'food-staples', 'ar' => 'سكر ناعم 5 كجم', 'en' => 'Fine Sugar 5 kg', 'description_ar' => 'سكر أبيض ناعم', 'description_en' => 'Fine white sugar', 'unit_ar' => 'كيس', 'unit_en' => 'Bag', 'sub_ar' => null, 'sub_en' => null, 'price' => 18.50, 'margin' => 15.00, 'stock' => 200, 'cost' => 14.00, 'items' => 1],
            ['code' => 'oils.cooking-oil.1-5l', 'category' => 'cooking-oils', 'ar' => 'زيت طبخ 1.5 لتر', 'en' => 'Cooking Oil 1.5 L', 'description_ar' => 'زيت نباتي للطبخ', 'description_en' => 'Vegetable cooking oil', 'unit_ar' => 'عبوة', 'unit_en' => 'Bottle', 'sub_ar' => 'كرتون', 'sub_en' => 'Carton', 'price' => 12.00, 'margin' => 12.00, 'stock' => 150, 'cost' => 9.50, 'items' => 12],
            ['code' => 'dairy.long-life-milk.1l', 'category' => 'dairy-products', 'ar' => 'حليب طويل الأجل 1 لتر', 'en' => 'Long-Life Milk 1 L', 'description_ar' => 'حليب كامل الدسم', 'description_en' => 'Full-fat milk', 'unit_ar' => 'حبة', 'unit_en' => 'Unit', 'sub_ar' => null, 'sub_en' => null, 'price' => 4.50, 'margin' => 5.00, 'stock' => 500, 'cost' => 3.50, 'items' => 12],
            ['code' => 'food.premium-pasta.500g', 'category' => 'food-staples', 'ar' => 'مكرونة 500 جرام', 'en' => 'Premium Pasta 500 g', 'description_ar' => 'مكرونة فاخرة', 'description_en' => 'Premium pasta', 'unit_ar' => 'كيس', 'unit_en' => 'Bag', 'sub_ar' => 'كرتون', 'sub_en' => 'Carton', 'price' => 3.00, 'margin' => 20.00, 'stock' => 300, 'cost' => 2.00, 'items' => 20],
            ['code' => 'hot-drinks.black-tea.100-bags', 'category' => 'hot-drinks', 'ar' => 'شاي أسود 100 كيس', 'en' => 'Black Tea 100 Bags', 'description_ar' => 'شاي أسود فرط', 'description_en' => 'Loose black tea bags', 'unit_ar' => 'علبة', 'unit_en' => 'Box', 'sub_ar' => null, 'sub_en' => null, 'price' => 15.00, 'margin' => 15.00, 'stock' => 100, 'cost' => 11.00, 'items' => 1],
            ['code' => 'hot-drinks.arabic-coffee.500g', 'category' => 'hot-drinks', 'ar' => 'قهوة عربية 500 جرام', 'en' => 'Arabic Coffee 500 g', 'description_ar' => 'قهوة عربية محمصة', 'description_en' => 'Roasted Arabic coffee', 'unit_ar' => 'كيس', 'unit_en' => 'Bag', 'sub_ar' => null, 'sub_en' => null, 'price' => 45.00, 'margin' => 25.00, 'stock' => 50, 'cost' => 32.00, 'items' => 1],
            ['code' => 'cold-drinks.orange-juice.200ml', 'category' => 'cold-drinks', 'ar' => 'عصير برتقال 200 مل', 'en' => 'Orange Juice 200 ml', 'description_ar' => 'عصير برتقال طبيعي', 'description_en' => 'Natural orange juice', 'unit_ar' => 'علبة', 'unit_en' => 'Can', 'sub_ar' => 'كرتون', 'sub_en' => 'Carton', 'price' => 1.50, 'margin' => 10.00, 'stock' => 1000, 'cost' => 1.00, 'items' => 30],
            ['code' => 'cleaning-paper.face-tissues.200', 'category' => 'cleaning-paper-goods', 'ar' => 'مناديل ورقية 200 منديل', 'en' => 'Facial Tissues 200 Sheets', 'description_ar' => 'مناديل وجه ناعمة', 'description_en' => 'Soft facial tissues', 'unit_ar' => 'علبة', 'unit_en' => 'Box', 'sub_ar' => null, 'sub_en' => null, 'price' => 3.50, 'margin' => 15.00, 'stock' => 400, 'cost' => 2.50, 'items' => 1],
            ['code' => 'cleaning-paper.dishwashing-liquid.1l', 'category' => 'cleaning-paper-goods', 'ar' => 'صابون غسيل أطباق 1 لتر', 'en' => 'Dishwashing Liquid 1 L', 'description_ar' => 'سائل غسيل أطباق برائحة الليمون', 'description_en' => 'Lemon-scented dishwashing liquid', 'unit_ar' => 'عبوة', 'unit_en' => 'Bottle', 'sub_ar' => 'كرتون', 'sub_en' => 'Carton', 'price' => 10.00, 'margin' => 18.00, 'stock' => 120, 'cost' => 7.50, 'items' => 12],
        ];

        foreach ($products as $seed) {
            $payload = [
                'catalog_code' => $seed['code'],
                'name' => $seed['ar'],
                'name_ar' => $seed['ar'],
                'name_en' => $seed['en'],
                'description' => $seed['description_ar'],
                'description_ar' => $seed['description_ar'],
                'description_en' => $seed['description_en'],
                'category_id' => $categories[$seed['category']] ?? null,
                'unit_price' => $seed['price'],
                'minimum_profit_margin' => $seed['margin'],
                'stock_quantity' => $seed['stock'],
                'unit_name' => $seed['unit_ar'],
                'unit_name_ar' => $seed['unit_ar'],
                'unit_name_en' => $seed['unit_en'],
                'items_per_unit' => $seed['items'],
                'sub_unit_name' => $seed['sub_ar'],
                'sub_unit_name_ar' => $seed['sub_ar'],
                'sub_unit_name_en' => $seed['sub_en'],
                'weighted_average_cost' => $seed['cost'],
                'created_by' => $adminUserId,
            ];

            $product = Product::query()->where('catalog_code', $seed['code'])->first()
                ?? Product::query()->where('name_ar', $seed['ar'])->orWhere('name', $seed['ar'])->first();
            if ($product === null) {
                $product = Product::updateOrCreate(['catalog_code' => $seed['code']], $payload);
                $wasCreated = $product->wasRecentlyCreated;
            } else {
                $product->update($payload);
                $wasCreated = false;
            }

            if ($wasCreated && $product->stock_quantity > 0) {
                $unitCost = (float) ($product->weighted_average_cost ?? 0);
                $costingService->recordPurchase(
                    $product->id,
                    0,
                    (int) $product->stock_quantity,
                    $unitCost,
                    (int) $product->stock_quantity * $unitCost,
                    'FIFO',
                    'initial_seed',
                    $product->id,
                );
            }
        }
    }
}

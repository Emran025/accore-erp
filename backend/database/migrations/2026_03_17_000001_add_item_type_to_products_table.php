<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Sales & Services Engine — Phase 1.
 * Extends the products table to support three item classes:
 *   - product       → physical goods, inventory-controlled, taxable
 *   - service       → intangible, no inventory, may have different tax rules
 *   - raw_material  → inventory-controlled, not sellable, used in manufacturing
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->enum('item_type', ['product', 'service', 'raw_material'])
                  ->default('product')
                  ->after('id')
                  ->comment('Classifies the item: physical product, service, or raw material');

            $table->boolean('taxable')
                  ->default(true)
                  ->after('item_type')
                  ->comment('Whether VAT/tax applies. Services may be exempt or have special rates.');

            $table->boolean('inventory_control')
                  ->default(true)
                  ->after('taxable')
                  ->comment('Only products and raw_materials track stock quantity.');

            $table->boolean('sellable')
                  ->default(true)
                  ->after('inventory_control')
                  ->comment('Raw materials are not sellable. Products and services are.');
        });

        // Set correct defaults for any existing products
        DB::table('products')->update([
            'item_type'         => 'product',
            'taxable'           => true,
            'inventory_control' => true,
            'sellable'          => true,
        ]);
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['item_type', 'taxable', 'inventory_control', 'sellable']);
        });
    }
};

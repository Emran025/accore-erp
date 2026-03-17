<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Sales & Services Engine — Phase 2.
 * Services do not have physical stock. Instead, they are "distributed" to
 * points of sale via availability records. This mirrors goods distribution
 * without quantities.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_availability', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')
                  ->constrained('products')
                  ->onDelete('cascade')
                  ->comment('References a product with item_type = service');
            $table->string('pos_location')
                  ->comment('Point-of-sale location identifier (branch, counter, etc.)');
            $table->boolean('active')->default(true);
            $table->date('effective_from')->nullable();
            $table->date('effective_to')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['service_id', 'pos_location']);
            $table->index(['pos_location', 'active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_availability');
    }
};

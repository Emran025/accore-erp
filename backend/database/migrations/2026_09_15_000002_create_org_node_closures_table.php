<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('org_node_closures', function (Blueprint $table) {
            $table->id();
            $table->string('plane_type', 32)->default('OPERATIONAL_HIERARCHY');
            $table->uuid('ancestor_uuid');
            $table->uuid('descendant_uuid');
            $table->unsignedInteger('depth')->default(0);
            $table->date('valid_from')->nullable();
            $table->date('valid_to')->nullable();
            $table->timestamps();

            $table->index(['plane_type', 'ancestor_uuid', 'depth'], 'idx_closure_ancestor');
            $table->index(['plane_type', 'descendant_uuid', 'depth'], 'idx_closure_descendant');
            $table->foreign('ancestor_uuid')
                ->references('node_uuid')
                ->on('structure_nodes')
                ->cascadeOnDelete();
            $table->foreign('descendant_uuid')
                ->references('node_uuid')
                ->on('structure_nodes')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('org_node_closures');
    }
};

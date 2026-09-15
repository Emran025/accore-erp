<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('structure_nodes', function (Blueprint $table) {
            $table->string('name_en', 255)->nullable()->after('code');
            $table->string('name_ar', 255)->nullable()->after('name_en');
            $table->json('facets_json')->nullable()->after('attributes_json');
            $table->uuid('legal_entity_uuid')->nullable()->after('node_uuid');
            $table->boolean('is_locked')->default(false)->after('status');

            $table->index('legal_entity_uuid');
            $table->index(['status', 'valid_from', 'valid_to'], 'idx_sn_status_validity');
        });

        Schema::table('structure_links', function (Blueprint $table) {
            $table->string('plane_type', 32)->default('OPERATIONAL_HIERARCHY')->after('link_type');
            $table->decimal('weight', 5, 2)->default(100.00)->after('priority');

            $table->index(['plane_type', 'valid_from', 'valid_to'], 'idx_sl_plane_validity');
            $table->index(['source_node_uuid', 'plane_type'], 'idx_sl_source_plane');
        });
    }

    public function down(): void
    {
        Schema::table('structure_links', function (Blueprint $table) {
            $table->dropIndex('idx_sl_source_plane');
            $table->dropIndex('idx_sl_plane_validity');
            $table->dropColumn(['plane_type', 'weight']);
        });

        Schema::table('structure_nodes', function (Blueprint $table) {
            $table->dropIndex('idx_sn_status_validity');
            $table->dropIndex(['legal_entity_uuid']);
            $table->dropColumn(['name_en', 'name_ar', 'facets_json', 'legal_entity_uuid', 'is_locked']);
        });
    }
};

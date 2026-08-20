<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_import_batches', function (Blueprint $table): void {
            $table->string('schema_version', 40)->default('product-import.v1')->after('batch_id');
            $table->foreignId('approved_by')->nullable()->after('created_by')->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->string('approval_digest', 128)->nullable()->after('approval_field_ids');
            $table->index(['schema_version', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('product_import_batches', function (Blueprint $table): void {
            $table->dropIndex(['schema_version', 'status']);
            $table->dropForeign(['approved_by']);
            $table->dropColumn(['schema_version', 'approved_by', 'approved_at', 'approval_digest']);
        });
    }
};

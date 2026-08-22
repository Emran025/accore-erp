<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('desktop_enrollment_evidences', function (Blueprint $table): void {
            $table->string('purpose', 32)->default('standard')->after('issued_by');
            $table->index(['purpose', 'used_at', 'revoked_at'], 'desktop_evidence_purpose_index');
        });

        Schema::table('desktop_devices', function (Blueprint $table): void {
            $table->boolean('is_primary')->default(false)->after('access_token_hash');
            $table->index(['is_primary', 'revoked_at'], 'desktop_devices_primary_lifecycle_index');
        });
    }

    public function down(): void
    {
        Schema::table('desktop_devices', function (Blueprint $table): void {
            $table->dropIndex('desktop_devices_primary_lifecycle_index');
            $table->dropColumn('is_primary');
        });

        Schema::table('desktop_enrollment_evidences', function (Blueprint $table): void {
            $table->dropIndex('desktop_evidence_purpose_index');
            $table->dropColumn('purpose');
        });
    }
};

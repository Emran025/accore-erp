<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sessions', function (Blueprint $table): void {
            $table->foreignId('desktop_device_id')
                ->nullable()
                ->after('user_id')
                ->constrained('desktop_devices')
                ->nullOnDelete();
            $table->char('refresh_token_hash', 64)->nullable()->unique()->after('session_token');
            $table->dateTime('refresh_expires_at')->nullable()->after('expires_at');
            $table->timestamp('revoked_at')->nullable()->after('refresh_expires_at');
            $table->string('revocation_reason', 120)->nullable()->after('revoked_at');
            $table->index(['desktop_device_id', 'revoked_at'], 'sessions_desktop_device_lifecycle_index');
        });
    }

    public function down(): void
    {
        Schema::table('sessions', function (Blueprint $table): void {
            $table->dropIndex('sessions_desktop_device_lifecycle_index');
            $table->dropForeign(['desktop_device_id']);
            $table->dropColumn([
                'desktop_device_id',
                'refresh_token_hash',
                'refresh_expires_at',
                'revoked_at',
                'revocation_reason',
            ]);
        });
    }
};

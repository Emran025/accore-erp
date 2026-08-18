<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Persist the minimal trust state required to pair an Accore Client with an
     * Accore Server. The tables deliberately contain no ERP data, credentials,
     * or user profile fields.
     */
    public function up(): void
    {
        Schema::create('desktop_enrollment_evidences', function (Blueprint $table): void {
            $table->id();
            $table->char('token_hash', 64)->unique();
            $table->string('label', 120)->nullable();
            $table->string('issued_by', 120)->default('local-administrator');
            $table->timestamp('expires_at');
            $table->timestamp('used_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->index(['expires_at', 'used_at', 'revoked_at'], 'desktop_evidence_validity_index');
        });

        Schema::create('desktop_devices', function (Blueprint $table): void {
            $table->id();
            $table->uuid('device_id')->unique();
            $table->string('display_name', 120);
            $table->string('platform', 32);
            $table->string('client_version', 64);
            $table->char('public_key_fingerprint', 64);
            $table->char('certificate_fingerprint', 64)->nullable();
            $table->char('access_token_hash', 64)->unique();
            $table->timestamp('enrolled_at');
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->string('revoked_reason', 255)->nullable();
            $table->timestamps();

            $table->index(['revoked_at', 'last_seen_at'], 'desktop_devices_lifecycle_index');
        });

        Schema::create('desktop_distribution_audit_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('desktop_device_id')->nullable()->constrained('desktop_devices')->nullOnDelete();
            $table->string('event_type', 100);
            $table->string('outcome', 32);
            $table->string('ip_address', 45)->nullable();
            $table->json('context')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['event_type', 'created_at'], 'desktop_audit_event_created_index');
            $table->index(['desktop_device_id', 'created_at'], 'desktop_audit_device_created_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('desktop_distribution_audit_events');
        Schema::dropIfExists('desktop_devices');
        Schema::dropIfExists('desktop_enrollment_evidences');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employee_documents', function (Blueprint $table) {
            $table->string('document_number')->nullable()->after('document_name');
            $table->date('issue_date')->nullable()->after('document_number');
            $table->date('expiration_date')->nullable()->after('issue_date');
            $table->string('status')->default('active')->after('expiration_date');
            
            $table->string('mime_type', 100)->nullable()->after('file_path');
            $table->integer('file_size')->nullable()->after('mime_type');
            
            $table->boolean('is_verified')->default(false)->after('uploaded_by');
            $table->foreignId('verified_by')->nullable()->after('is_verified')->constrained('users')->onDelete('set null');
            $table->timestamp('verified_at')->nullable()->after('verified_by');
        });
    }

    public function down(): void
    {
        Schema::table('employee_documents', function (Blueprint $table) {
            $table->dropForeign(['verified_by']);
            
            $table->dropColumn([
                'document_number',
                'issue_date',
                'expiration_date',
                'status',
                'mime_type',
                'file_size',
                'is_verified',
                'verified_by',
                'verified_at',
            ]);
        });
    }
};

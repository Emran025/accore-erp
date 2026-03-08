<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('document_number')->unique()->nullable();
            $table->string('document_type'); // Category
            $table->string('title');
            $table->text('description')->nullable();
            
            // File details
            $table->string('file_path', 500);
            $table->string('file_name', 255);
            $table->string('mime_type', 100)->nullable();
            $table->integer('file_size')->nullable();
            
            // Lifecycle
            $table->date('issue_date')->nullable();
            $table->date('expiration_date')->nullable();
            $table->string('status')->default('active'); // active, expired, pending, etc.
            
            // Verification
            $table->boolean('is_verified')->default(false);
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('verified_at')->nullable();
            
            // Ownership
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->onDelete('set null');

            // Polymorphic relation to link to any ERP entity (Supplier, Invoice, etc.) if needed in the future
            $table->nullableMorphs('documentable'); 

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};

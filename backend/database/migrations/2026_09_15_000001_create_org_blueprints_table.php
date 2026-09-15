<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('org_blueprints', function (Blueprint $table) {
            $table->id();
            $table->uuid('blueprint_uuid')->unique();
            $table->string('name', 255);
            $table->string('status', 20)->default('staged'); // staged, validated, published, archived
            $table->unsignedTinyInteger('complexity_grade')->default(1);
            $table->string('primary_archetype', 64)->default('SIMPLE_HIERARCHY');
            $table->longText('blueprint_json');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('primary_archetype');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('org_blueprints');
    }
};

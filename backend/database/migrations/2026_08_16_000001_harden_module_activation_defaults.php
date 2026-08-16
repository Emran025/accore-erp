<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * New business modules must be explicitly activated after their setup is
     * verified. This changes only the column default; it deliberately does
     * not mutate states of modules already operating in existing installs.
     */
    public function up(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->boolean('is_active')->default(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->change();
        });
    }
};

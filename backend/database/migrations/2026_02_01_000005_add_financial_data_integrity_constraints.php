<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Unique Constraint (Account Code)
        Schema::table('chart_of_accounts', function (Blueprint $table) {
            if (!$this->indexExists('chart_of_accounts', 'chart_of_accounts_account_code_unique')) {
                $table->unique('account_code', 'chart_of_accounts_account_code_unique');
            }
        });

        // 2. Check Constraints (General Ledger & Inventory)
        if ($this->supportsCheckConstraints()) {
            // Using raw SQL to ensure exact constraint names
            // Use "IF NOT EXISTS" logic isn't standard SQL, so we try-catch or just run
            try {
                DB::statement('ALTER TABLE general_ledger ADD CONSTRAINT chk_amount_positive CHECK (amount > 0)');
                DB::statement('ALTER TABLE inventory_costing ADD CONSTRAINT chk_quantity_positive CHECK (quantity >= 0)');
            } catch (\Exception $e) {
                // Constraint might already exist
            }
        }
    }

    public function down(): void
    {
        // Remove Constraints
        if ($this->supportsCheckConstraints()) {
            $driver = DB::getDriverName();
            $isMariaDB = str_contains(DB::select('SELECT VERSION() as version')[0]->version, 'MariaDB');

            // MariaDB and modern MySQL/PostgreSQL all support "DROP CONSTRAINT"
            // MySQL 8 specifically introduced "DROP CHECK", but "DROP CONSTRAINT" is more universal
            try {
                if ($isMariaDB || $driver === 'pgsql') {
                    DB::statement('ALTER TABLE general_ledger DROP CONSTRAINT chk_amount_positive');
                    DB::statement('ALTER TABLE inventory_costing DROP CONSTRAINT chk_quantity_positive');
                } else {
                    // Standard MySQL 8.0.16+
                    DB::statement('ALTER TABLE general_ledger DROP CHECK chk_amount_positive');
                    DB::statement('ALTER TABLE inventory_costing DROP CHECK chk_quantity_positive');
                }
            } catch (\Exception $e) {
                // Constraint might not exist
            }
        }

        // Remove unique constraint
        Schema::table('chart_of_accounts', function (Blueprint $table) {
            if ($this->indexExists('chart_of_accounts', 'chart_of_accounts_account_code_unique')) {
                $table->dropUnique('chart_of_accounts_account_code_unique');
            }
        });
    }

    /**
     * Determine if the current database supports CHECK constraints
     */
    private function supportsCheckConstraints(): bool
    {
        $driver = DB::getDriverName();
        $version = DB::select('SELECT VERSION() as version')[0]->version;

        if (str_contains($version, 'MariaDB')) {
            // MariaDB supports CHECK constraints since 10.2.1
            return version_compare($version, '10.2.1', '>=');
        }

        if ($driver === 'mysql') {
            // MySQL supports CHECK constraints since 8.0.16
            return version_compare($version, '8.0.16', '>=');
        }

        return in_array($driver, ['pgsql', 'sqlite']);
    }

    /**
     * Check if an index exists on a table
     */
    private function indexExists(string $table, string $indexName): bool
    {
        $driver = DB::getDriverName();
        
        if ($driver === 'mysql') {
            $indexes = DB::select("SHOW INDEXES FROM {$table} WHERE Key_name = ?", [$indexName]);
            return !empty($indexes);
        } elseif ($driver === 'pgsql') {
            $indexes = DB::select("SELECT indexname FROM pg_indexes WHERE tablename = ? AND indexname = ?", [$table, $indexName]);
            return !empty($indexes);
        } elseif ($driver === 'sqlite') {
            $indexes = DB::select("PRAGMA index_list('{$table}')");
            foreach ($indexes as $index) {
                if ($index->name === $indexName) return true;
            }
        }
        return false;
    }
};
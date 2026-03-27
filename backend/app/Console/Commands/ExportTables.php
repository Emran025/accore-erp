<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ExportTables extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:export-tables';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tables = DB::select('SHOW TABLES');

        $tableNames = array_map(
            fn ($t) => array_values((array) $t)[0],
            $tables
        );

        file_put_contents(
            base_path('../.engines/documentation-engine/tables-doc.json'),

            json_encode($tableNames, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
        );

        $this->info('تم إنشاء ملف tables-doc.json بنجاح');
    }
}

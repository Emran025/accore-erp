<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;

class ExportTablesDocumentation extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:export-tables-documentation';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Splits and exports all database tables into the domain-driven documentation tree.';

    protected $domainMap = [
        'Assets/AssetLifecycle' => ['asset', 'depreciation', 'equipment', 'maintenance'],
        'Assets/Investments' => ['investment', 'portfolio', 'bond', 'stock'],
        
        'Commercial/CRM' => ['crm', 'customer', 'lead', 'opportunity', 'contact', 'ar_customer'],
        'Commercial/MarketingDistribution' => ['market', 'campaign', 'distribution'],
        'Commercial/RevenueReceivables' => ['ar_trans', 'revenue', 'invoice', 'zatca', 'sales_return'],
        'Commercial/SalesGovernance' => ['sales_gov', 'sales_policy'],
        'Commercial/SalesLifecycle' => ['sales_rep', 'sales_order', 'quote', 'contract'],
        
        'Finance/AuditCompliance' => ['audit_trail', 'reconciliation'],
        'Finance/ForeignExchange' => ['currenc', 'exchange_rate', 'revaluation'],
        'Finance/GeneralLedger' => ['gl_', 'general_ledger', 'chart_of_accounts', 'journal', 'fiscal', 'accounting', 'ledger', 'prepayment', 'unearned', 'recurring'],
        'Finance/ManagementAccounting' => ['budget', 'forecast', 'variance', 'cost_center', 'profit_center'],
        'Finance/TaxCompliance' => ['tax', 'vat', 'government_fee', 'zatca_einvoices'],
        'Finance/Treasury' => ['bank', 'cash', 'reconciliation', 'treasury'],

        'HumanCapital/KnowledgePortal' => ['knowledge', 'faq', 'article', 'portal', 'learning', 'course', 'enrollment', 'expertise', 'survey'],
        'HumanCapital/PayrollBenefits' => ['payroll', 'salary', 'benefit', 'allowance', 'deduction', 'compensation', 'loan'],
        'HumanCapital/PerformanceDevelopment' => ['performance', 'appraisal', 'goal', 'training', 'feedback', 'survey'],
        'HumanCapital/ServicesWellness' => ['wellness', 'health', 'medical', 'insurance', 'leave', 'vacation', 'travel'],
        'HumanCapital/TalentRecruitment' => ['applicant', 'recruitment', 'interview', 'job_title', 'requisition', 'position', 'succession'],
        'HumanCapital/TimeProductivity' => ['attendance', 'time', 'shift', 'schedule', 'biometric', 'tracking'],
        'HumanCapital/HRCompliance' => ['hr_policy', 'disciplinary', 'grievance', 'ehs_', 'ppe'],
        'HumanCapital/HRAdvanced' => ['hr_advanced', 'manpower'],
        'HumanCapital/WorkforceAdmin' => ['employee', 'worker', 'expat', 'contingent', 'department', 'onboard'],

        'Intelligence/AdvancedAnalytics' => ['analytic', 'prediction', 'model'],
        'Intelligence/BusinessIntelligence' => ['report', 'dashboard', 'bi_', 'kpi'],

        'Manufacturing/Engineering' => ['bom', 'routing', 'engineering', 'design'],
        'Manufacturing/ProductionControl' => ['production', 'work_order', 'manufactur'],
        'Manufacturing/QualityControl' => ['quality', 'inspection', 'test', 'defect'],

        'Platform/Automation' => ['workflow', 'automation', 'trigger'],
        'Platform/Communication' => ['message', 'email', 'sms', 'notification', 'announcement', 'chat'],
        'Platform/Customization' => ['custom_field', 'template', 'ui_pref'],
        'Platform/IntegrationHub' => ['integration', 'api', 'webhook', 'sync'],

        'Projects/ExecutionTracking' => ['project_task', 'milestone', 'timesheet'],
        'Projects/ProjectFinance' => ['project_cost', 'project_budget', 'project_revenue'],
        'Projects/ProjectPlanning' => ['project', 'wbs', 'resource_alloc'],

        'SupplyChain/Inventory' => ['inventory', 'stock', 'warehouse', 'product', 'categor', 'item'],
        'SupplyChain/PayablesExpenses' => ['ap_', 'payable', 'expense', 'supplier_payment', 'payment'],
        'SupplyChain/Procurement' => ['purchase', 'procure', 'pr_', 'po_', 'rfp', 'rfq'],
        'SupplyChain/SupplierSourcing' => ['supplier', 'vendor', 'sourcing'],

        'EnterpriseCore/IdentityAccess' => ['user', 'role', 'permission', 'session', 'login', 'token', 'admin', 'password', 'module'],
        'EnterpriseCore/MonitoringCompliance' => ['audit', 'log', 'telescope', 'failed_job', 'capa', 'compliance', 'qa_', 'mistake'],
        'EnterpriseCore/OrganizationGovernance' => ['org_', 'structure', 'branch', 'company', 'topology', 'school', 'student', 'teacher', 'halaqah'],
        'EnterpriseCore/SystemOverview' => ['setting', 'config', 'migration', 'cache', 'job', 'batch', 'document', 'sequence', 'nr_', 'frequency', 'plan', 'unit', 'term', 'privac', 'servic', 'tag'],
        'EnterpriseCore/Automation' => ['enterprise_autom']
    ];

    /**
     * Complete list of required files to perfectly match the tree.
     */
    protected $requiredFiles = [
        'Assets/AssetLifecycle', 'Assets/Investments',
        'Commercial/CRM', 'Commercial/MarketingDistribution', 'Commercial/RevenueReceivables', 'Commercial/SalesGovernance', 'Commercial/SalesLifecycle',
        'EnterpriseCore/Automation', 'EnterpriseCore/IdentityAccess', 'EnterpriseCore/MonitoringCompliance', 'EnterpriseCore/OrganizationGovernance', 'EnterpriseCore/SystemOverview',
        'Finance/AuditCompliance', 'Finance/ForeignExchange', 'Finance/GeneralLedger', 'Finance/ManagementAccounting', 'Finance/TaxCompliance', 'Finance/Treasury',
        'HumanCapital/HRAdvanced', 'HumanCapital/HRCompliance', 'HumanCapital/KnowledgePortal', 'HumanCapital/PayrollBenefits', 'HumanCapital/PerformanceDevelopment', 'HumanCapital/ServicesWellness', 'HumanCapital/TalentRecruitment', 'HumanCapital/TimeProductivity', 'HumanCapital/WorkforceAdmin',
        'Intelligence/AdvancedAnalytics', 'Intelligence/BusinessIntelligence',
        'Manufacturing/Engineering', 'Manufacturing/ProductionControl', 'Manufacturing/QualityControl',
        'Platform/Automation', 'Platform/Communication', 'Platform/Customization', 'Platform/IntegrationHub',
        'Projects/ExecutionTracking', 'Projects/ProjectFinance', 'Projects/ProjectPlanning',
        'SupplyChain/Inventory', 'SupplyChain/PayablesExpenses', 'SupplyChain/Procurement', 'SupplyChain/SupplierSourcing'
    ];

    public function handle()
    {
        $this->info('Starting Bounded-Context Schema Documentation Engine...');

        try {
            $tablesQuery = DB::select('SHOW TABLES');
            $tableNames = array_map(fn ($t) => array_values((array) $t)[0], $tablesQuery);
            sort($tableNames);
        } catch (\Exception $e) {
            $this->error('Database connection failed: ' . $e->getMessage());
            return 1;
        }

        $basePath = base_path('../docs/Domains');
        
        // Categorize tables
        $domainTables = [];
        $unmatchedTables = [];

        foreach ($tableNames as $table) {
            $matched = false;
            foreach ($this->domainMap as $domainPath => $keywords) {
                foreach ($keywords as $keyword) {
                    if (Str::contains(strtolower($table), $keyword)) {
                        $domainTables[$domainPath][] = $table;
                        $matched = true;
                        break 2;
                    }
                }
            }
            if (!$matched) {
                $domainTables['EnterpriseCore/SystemOverview'][] = $table;
                $unmatchedTables[] = $table;
            }
        }

        if (!File::exists($basePath)) {
            File::makeDirectory($basePath, 0755, true);
        }

        // Generate files
        foreach ($this->requiredFiles as $domainPath) {
            $tablesInDomain = $domainTables[$domainPath] ?? [];

            if (empty($tablesInDomain)) {
                $content = $this->generatePlaceholderMarkdown($domainPath);
            } else {
                $content = $this->generateMarkdownForDomain($domainPath, $tablesInDomain);
            }

            $filePath = $basePath . '/' . $domainPath . '/database_Schema.md';
            $dirPath = dirname($filePath);
            if (!File::exists($dirPath)) {
                File::makeDirectory($dirPath, 0755, true);
            }

            file_put_contents($filePath, $content);
            $this->info("Generated Bounded Context: {$domainPath}/database_Schema.md");
        }

        if (!empty($unmatchedTables)) {
            $this->warn("Unmatched tables defaulted to SystemOverview: " . implode(', ', $unmatchedTables));
        }

        $this->info("Massive domain-driven documentation successfully generated across the file-tree!");
        return 0;
    }

    protected function generateMarkdownForDomain($domainPath, $tables)
    {
        $parts = explode('/', $domainPath);
        $domain = $parts[0];
        $module = $parts[1];

        $markdown = "# {$domain} - {$module}\n\n";
        $markdown .= "> **Bounded Context Schema & ERD**\n";
        $markdown .= "> " . count($tables) . " Tables | Generated dynamically by ACCSYSTEM engine\n\n";
        $markdown .= "---\n\n";

        // Table List
        $markdown .= "## Tables List\n\n";
        foreach ($tables as $table) {
            $markdown .= "- `{$table}`\n";
        }
        $markdown .= "\n---\n\n";

        // ER Diagram
        $markdown .= "## Entity Relationship Diagram\n\n";
        $markdown .= "```mermaid\n";
        $markdown .= "erDiagram\n";
        
        $relations = [];
        foreach ($tables as $table) {
            $markdown .= "    {$table} {\n";
            $columns = Schema::getColumns($table);
            $indexes = Schema::getIndexes($table);
            $foreignKeys = Schema::getForeignKeys($table);

            foreach ($columns as $column) {
                $colName = $column['name'];
                $typeStr = preg_replace('/([^a-zA-Z0-9_])/', '', $column['type']);
                if(strlen($typeStr) > 20) $typeStr = substr($typeStr, 0, 20);
                if ($typeStr === '') $typeStr = 'string';

                $isPk = false; $isFk = false; $isUk = false;
                foreach ($indexes as $index) {
                    if (in_array($colName, $index['columns'])) {
                        if ($index['primary']) $isPk = true;
                        if ($index['unique']) $isUk = true;
                    }
                }
                foreach ($foreignKeys as $fk) {
                    if (in_array($colName, $fk['columns'])) {
                        $isFk = true;
                        $relations[] = "    {$fk['foreign_table']} ||--o{ {$table} : \"{$colName}\"";
                    }
                }

                $markers = [];
                if ($isPk) $markers[] = "PK";
                if ($isFk) $markers[] = "FK";
                if ($isUk) $markers[] = "UK";
                $markerStr = implode(",", $markers);

                $markdown .= "        {$typeStr} {$colName} " . (!empty($markers) ? "\"{$markerStr}\"" : "") . "\n";
            }
            $markdown .= "    }\n";
        }
        foreach (array_unique($relations) as $rel) {
            $markdown .= $rel . "\n";
        }
        $markdown .= "```\n\n";
        $markdown .= "---\n\n";

        // Detailed tables
        $markdown .= "## Data Dictionary\n\n";
        foreach ($tables as $table) {
            $markdown .= "### Table: `{$table}`\n\n";
            $markdown .= "| Column | Type | Nullable | Default | Indexes | Foreign Keys |\n";
            $markdown .= "|---|---|---|---|---|---|\n";
            
            $columns = Schema::getColumns($table);
            $indexes = Schema::getIndexes($table);
            $foreignKeys = Schema::getForeignKeys($table);

            foreach ($columns as $column) {
                $colName = $column['name'];
                $type = $column['type'];
                $nullable = $column['nullable'] ? 'Yes' : 'No';
                
                $default = $column['default'] ?? '';
                if (is_array($default) || is_object($default)) {
                    $default = json_encode($default);
                } else {
                    $default = (string) $default;
                }
                if ($default !== '') {
                    $default = '`' . str_replace('|', '\|', $default) . '`';
                }

                $colIndexes = [];
                foreach ($indexes as $index) {
                    if (in_array($colName, $index['columns'])) {
                        if ($index['primary']) $colIndexes[] = '**PK**';
                        elseif ($index['unique']) $colIndexes[] = '*UK*';
                        else $colIndexes[] = 'IDX';
                    }
                }
                $indexStr = implode(', ', $colIndexes);

                $colFks = [];
                foreach ($foreignKeys as $fk) {
                    if (in_array($colName, $fk['columns'])) {
                        $colFks[] = "-> `{$fk['foreign_table']}.{$fk['foreign_columns'][0]}`";
                    }
                }
                $fkStr = implode('<br>', $colFks);

                $markdown .= "| `{$colName}` | `{$type}` | {$nullable} | {$default} | {$indexStr} | {$fkStr} |\n";
            }
            $markdown .= "\n";
        }

        return $markdown;
    }

    protected function generatePlaceholderMarkdown($domainPath)
    {
        $parts = explode('/', $domainPath);
        $domain = $parts[0];
        $module = $parts[1];

        $markdown = "# {$domain} - {$module}\n\n";
        $markdown .= "> **Bounded Context Schema & ERD**\n";
        $markdown .= "> " . "0" . " Tables Mapped\n\n";
        $markdown .= "---\n\n";
        $markdown .= "*No specific tables are currently mapped or active in this Bounded Context.*\n";
        return $markdown;
    }}

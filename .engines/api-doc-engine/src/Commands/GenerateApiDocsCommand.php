<?php

namespace ApiDocEngine\Commands;

use ApiDocEngine\Core\DocWriter;
use ApiDocEngine\Core\FormRequestExtractor;
use ApiDocEngine\Core\NamespaceMapper;
use ApiDocEngine\Core\OpenApiBuilder;
use ApiDocEngine\Core\RouteScanner;
use ApiDocEngine\Core\RulesConverter;
use Illuminate\Console\Command;

class GenerateApiDocsCommand extends Command
{
    protected $signature   = 'api-docs:generate {--dry-run : Show what would be generated without writing files}';
    protected $description = 'Generate OpenAPI 3.x YAML documentation from the live Laravel router';

    private const TARGET_TREE = [
        'Assets'         => ['AssetLifecycle', 'Investments'],
        'Commercial'     => ['CRM', 'MarketingDistribution', 'RevenueReceivables', 'SalesGovernance', 'SalesLifecycle'],
        'EnterpriseCore' => ['Automation', 'IdentityAccess', 'MonitoringCompliance', 'OrganizationGovernance', 'SystemOverview'],
        'Finance'        => ['AuditCompliance', 'ForeignExchange', 'GeneralLedger', 'ManagementAccounting', 'TaxCompliance', 'Treasury'],
        'HumanCapital'   => ['HRAdvanced', 'HRCompliance', 'KnowledgePortal', 'PayrollBenefits', 'PerformanceDevelopment', 'ServicesWellness', 'TalentRecruitment', 'TimeProductivity', 'WorkforceAdmin'],
        'Intelligence'   => ['AdvancedAnalytics', 'BusinessIntelligence'],
        'Manufacturing'  => ['Engineering', 'ProductionControl', 'QualityControl'],
        'Platform'       => ['Automation', 'Communication', 'Customization', 'IntegrationHub'],
        'Projects'       => ['ExecutionTracking', 'ProjectFinance', 'ProjectPlanning'],
        'SupplyChain'    => ['Inventory', 'PayablesExpenses', 'Procurement', 'SupplierSourcing'],
    ];

    public function handle(): int
    {
        $dryRun  = $this->option('dry-run');
        $docsDir = base_path('../docs/Domains');

        $this->components->info('API Documentation Engine — starting autonomous generation');
        $this->newLine();

        $this->components->task('Scanning routes', function () use (&$routes) {
            $scanner = new RouteScanner();
            $routes  = $scanner->scan();
        });
        $this->line("  <fg=gray>→ Discovered " . count($routes) . " API routes</>");

        $this->components->task('Mapping routes to domain/sub-domain tree', function () use ($routes, &$groups) {
            $mapper = new NamespaceMapper();
            $groups = $mapper->groupByDomain($routes);
        });

        $domainCount    = count($groups);
        $subDomainCount = array_sum(array_map('count', $groups));
        $this->line("  <fg=gray>→ Mapped $domainCount domains, $subDomainCount sub-domains</>");

        $extractor = new FormRequestExtractor();
        $converter = new RulesConverter();
        $builder   = new OpenApiBuilder($extractor, $converter);
        $writer    = new DocWriter($docsDir);

        $written   = 0;
        $stubbed   = 0;
        $schemas   = 0;

        $this->newLine();
        $this->components->info('Generating OpenAPI documents...');
        $this->newLine();

        foreach (self::TARGET_TREE as $domain => $subDomains) {
            $this->line("<fg=cyan>  $domain</>");

            foreach ($subDomains as $subDomain) {
                $routesForSubDomain = $groups[$domain][$subDomain] ?? [];
                $hasRoutes          = !empty($routesForSubDomain);
                $routeCount         = count($routesForSubDomain);

                if ($hasRoutes) {
                    $openApi     = $builder->build($domain, $subDomain, $routesForSubDomain);
                    $schemaCount = count($openApi['components']['schemas'] ?? []);
                    $baseCount   = 4;
                    $reqSchemas  = max(0, $schemaCount - $baseCount);

                    if (!$dryRun) {
                        $file = $writer->write($domain, $subDomain, $openApi);
                    }

                    $pathCount = count($openApi['paths'] ?? []);
                    $this->line("    <fg=green>✓</> $subDomain  <fg=gray>($routeCount routes · $pathCount paths · $reqSchemas request schemas)</>");
                    $written++;
                    $schemas += $reqSchemas;
                } else {
                    if (!$dryRun) {
                        $writer->ensureStubExists($domain, $subDomain);
                    }
                    $this->line("    <fg=yellow>~</> $subDomain  <fg=gray>(no routes — stub generated)</>");
                    $stubbed++;
                }
            }

            $this->newLine();
        }

        if ($dryRun) {
            $this->components->warn('Dry-run mode: no files were written.');
        } else {
            $this->components->success("Documentation generated successfully.");
            $this->line("  <fg=gray>→ $written sub-domains documented with real routes</>");
            $this->line("  <fg=gray>→ $stubbed sub-domains stubbed (placeholder, no routes yet)</>");
            $this->line("  <fg=gray>→ $schemas request schemas extracted from FormRequests</>");
            $this->line("  <fg=gray>→ Output: $docsDir</>");
        }

        return Command::SUCCESS;
    }
}

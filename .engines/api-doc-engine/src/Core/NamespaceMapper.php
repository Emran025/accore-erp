<?php

namespace ApiDocEngine\Core;

class NamespaceMapper
{
    private const V2_NS = 'App\\Http\\Controllers\\Api\\V2\\';

    private const CLASS_OVERRIDES = [
        'EnterpriseCore\\OrganizationGovernance\\ComplianceProfileController' => ['EnterpriseCore', 'MonitoringCompliance'],
        'EnterpriseCore\\OrganizationGovernance\\AuditTrailController'        => ['EnterpriseCore', 'MonitoringCompliance'],
        'EnterpriseCore\\OrganizationGovernance\\AuditLogController'          => ['EnterpriseCore', 'MonitoringCompliance'],
        'HumanCapital\\HRCompliance\\KnowledgeManagementController'           => ['HumanCapital', 'KnowledgePortal'],
        'Assets\\AssetsController'                                            => ['Assets', 'AssetLifecycle'],
        'Assets\\EmployeeAssetsController'                                    => ['Assets', 'AssetLifecycle'],
    ];

    public function map(string $action): ?array
    {
        if (!str_contains($action, self::V2_NS)) {
            return null;
        }

        $relative = ltrim(str_replace(self::V2_NS, '', explode('@', $action)[0]), '\\');

        foreach (self::CLASS_OVERRIDES as $suffix => $mapping) {
            if (str_ends_with($relative, $suffix)) {
                return $mapping;
            }
        }

        $parts = explode('\\', $relative);

        if (count($parts) >= 3) {
            return [$parts[0], $parts[1]];
        }

        if (count($parts) === 2) {
            return [$parts[0], $parts[0]];
        }

        return null;
    }

    public function groupByDomain(array $routes): array
    {
        $groups = [];

        foreach ($routes as $route) {
            $mapping = $this->map($route['action']);
            if (!$mapping) {
                continue;
            }
            [$domain, $subDomain] = $mapping;
            $groups[$domain][$subDomain][] = $route;
        }

        ksort($groups);
        foreach ($groups as $domain => &$subDomains) {
            ksort($subDomains);
        }

        return $groups;
    }
}

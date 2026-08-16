import type { CatalogKey } from '@/lib/i18n';

export const operatingContextReadinessContent = {
  title: 'enterpriseCore.orgHierarchy.operationalStoreReadiness',
  readyDescription: 'enterpriseCore.orgHierarchy.readyWarehouseDrivenSalesPurchasing',
  fallbackDescription:
    'enterpriseCore.orgHierarchy.configureWarehouseFinancialCentersPosTerminalBeginOperations',
  readyAction: 'enterpriseCore.orgHierarchy.reviewOperatingContext',
  configureAction: 'enterpriseCore.orgHierarchy.configureStore',
  continueModuleSetupAction: 'enterpriseCore.orgHierarchy.continueModuleSetup',
  activateAction: 'enterpriseCore.orgHierarchy.activateReadyModulesAndEnterSystem',
  selectorLabel: 'enterpriseCore.orgHierarchy.selectOperatingContext',
  organizationScope: 'enterpriseCore.orgHierarchy.operatingContextScopeOrganization',
  personalScope: 'enterpriseCore.orgHierarchy.operatingContextScopePersonal',
  readinessReady: 'enterpriseCore.orgHierarchy.readinessReady',
  required: 'common.general.required',
  fallbackReadinessLabel: 'common.general.readiness',
  readiness: {
    org_node: {
      label: 'enterpriseCore.orgHierarchy.organizationalUnit',
      action: 'enterpriseCore.orgHierarchy.organizationalUnit',
    },
    warehouse: {
      label: 'enterpriseCore.orgHierarchy.readinessWarehouse',
      action: 'enterpriseCore.orgHierarchy.readinessActionWarehouse',
    },
    cost_center: {
      label: 'enterpriseCore.orgHierarchy.readinessCostCenter',
      action: 'enterpriseCore.orgHierarchy.readinessActionCostCenter',
    },
    profit_center: {
      label: 'enterpriseCore.orgHierarchy.readinessProfitCenter',
      action: 'enterpriseCore.orgHierarchy.readinessActionProfitCenter',
    },
    pos_terminal: {
      label: 'enterpriseCore.orgHierarchy.readinessPosTerminal',
      action: 'enterpriseCore.orgHierarchy.readinessActionPosTerminal',
    },
  },
} as const satisfies {
  title: CatalogKey;
  readyDescription: CatalogKey;
  fallbackDescription: CatalogKey;
  readyAction: CatalogKey;
  configureAction: CatalogKey;
  continueModuleSetupAction: CatalogKey;
  activateAction: CatalogKey;
  selectorLabel: CatalogKey;
  organizationScope: CatalogKey;
  personalScope: CatalogKey;
  readinessReady: CatalogKey;
  required: CatalogKey;
  fallbackReadinessLabel: CatalogKey;
  readiness: Record<string, { label: CatalogKey; action: CatalogKey }>;
};

export type OperatingReadinessKey = keyof typeof operatingContextReadinessContent.readiness;

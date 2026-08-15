'use client';

import { useI18n, catalogText, catalogMessage } from "@/lib/i18n";
import { MainLayout } from '@/components/layout';
import {
  Button,
  Dialog,
  SearchableSelect,
  TabNavigation,
  type SelectOption,
  showAlert,
} from '@/components/ui';
import { fetchAPI } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useOperatingContextStore } from '@/stores/useOperatingContextStore';
import { useEffect, useMemo, useState } from 'react';
import { OrganizationalStructure } from './OrganizationalStructure';

type OrgTab =
  | 'dashboard'
  | 'nodes'
  | 'meta_types'
  | 'topology_rules'
  | 'links'
  | 'hierarchy'
  | 'scope_context'
  | 'integrity'
  | 'change_history';

type SetupForm = {
  org_node_uuid: string | null;
  cost_center_id: number | null;
  profit_center_id: number | null;
  warehouse_code: string;
  warehouse_name: string;
  pos_code: string;
  pos_name: string;
};

const initialSetupForm: SetupForm = {
  org_node_uuid: null,
  cost_center_id: null,
  profit_center_id: null,
  warehouse_code: 'WH-MAIN',
  warehouse_name: catalogMessage("enterpriseCore.orgHierarchy.mainWarehouse"),
  pos_code: 'POS-MAIN',
  pos_name: catalogMessage("enterpriseCore.orgHierarchy.mainPos"),
};

function listFromResponse(response: any): any[] {
  const raw = response?.data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

export default function OrganizationalStructurePage() {
    const { t: i18n } = useI18n();
  const [activeTab, setActiveTab] = useState<OrgTab>('dashboard');
  const [setupOpen, setSetupOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [setupForm, setSetupForm] = useState<SetupForm>(initialSetupForm);
  const [nodes, setNodes] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [profitCenters, setProfitCenters] = useState<any[]>([]);
  const { readiness, loadReadiness } = useOperatingContextStore();
  const readinessLabels: Record<string, string> = {
    warehouse: i18n.catalog["enterpriseCore.orgHierarchy.readinessWarehouse"],
    cost_center: i18n.catalog["enterpriseCore.orgHierarchy.readinessCostCenter"],
    profit_center: i18n.catalog["enterpriseCore.orgHierarchy.readinessProfitCenter"],
    pos_terminal: i18n.catalog["enterpriseCore.orgHierarchy.readinessPosTerminal"],
  };
  const readinessActions: Record<string, string> = {
    warehouse: i18n.catalog["enterpriseCore.orgHierarchy.readinessActionWarehouse"],
    cost_center: i18n.catalog["enterpriseCore.orgHierarchy.readinessActionCostCenter"],
    profit_center: i18n.catalog["enterpriseCore.orgHierarchy.readinessActionProfitCenter"],
    pos_terminal: i18n.catalog["enterpriseCore.orgHierarchy.readinessActionPosTerminal"],
  };

  useEffect(() => {
    const loadSetupData = async () => {
      const [nodeResponse, costResponse, profitResponse] = await Promise.all([
        fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.NODES),
        fetchAPI(API_ENDPOINTS.FINANCE.COST_CENTERS.BASE),
        fetchAPI(API_ENDPOINTS.FINANCE.PROFIT_CENTERS.BASE),
      ]);
      setNodes(listFromResponse(nodeResponse));
      setCostCenters(listFromResponse(costResponse).filter((center) => center.is_active !== false));
      setProfitCenters(
        listFromResponse(profitResponse).filter((center) => center.is_active !== false)
      );
      await loadReadiness();
    };
    loadSetupData();
  }, [loadReadiness]);

  const nodeOptions = useMemo<SelectOption[]>(
    () =>
      nodes.map((node) => ({
        value: node.node_uuid,
        label: node.code || node.node_uuid,
        subtitle: node.status,
      })),
    [nodes]
  );
  const costCenterOptions = useMemo<SelectOption[]>(
    () =>
      costCenters.map((center) => ({
        value: center.id,
        label: catalogText(i18n, "common.general.notAvailable.alternative10", { value0: center.code, value1: center.name }),
        subtitle: center.name_en || '',
      })),
    [costCenters]
  );
  const profitCenterOptions = useMemo<SelectOption[]>(
    () =>
      profitCenters.map((center) => ({
        value: center.id,
        label: catalogText(i18n, "common.general.notAvailable.alternative10", { value0: center.code, value1: center.name }),
        subtitle: center.name_en || '',
      })),
    [profitCenters]
  );

  const updateSetupField = <K extends keyof SetupForm>(key: K, value: SetupForm[K]) => {
    setSetupForm((current) => ({ ...current, [key]: value }));
  };

  const configureStore = async () => {
    if (
      !setupForm.cost_center_id ||
      !setupForm.profit_center_id ||
      !setupForm.warehouse_code ||
      !setupForm.warehouse_name ||
      !setupForm.pos_code ||
      !setupForm.pos_name
    ) {
      showAlert(
        'operating-context-alert',
        i18n.catalog["enterpriseCore.orgHierarchy.pleaseCompleteRequiredOperatingConfigurationFields"],
        'error'
      );
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.OPERATING_CONTEXT.CONFIGURE, {
        method: 'POST',
        body: JSON.stringify({
          org_node_uuid: setupForm.org_node_uuid,
          cost_center_id: setupForm.cost_center_id,
          profit_center_id: setupForm.profit_center_id,
          warehouse: {
            code: setupForm.warehouse_code,
            name: setupForm.warehouse_name,
          },
          pos_terminal: {
            code: setupForm.pos_code,
            name: setupForm.pos_name,
          },
        }),
      });
      if (!response.success) {
        showAlert(
          'operating-context-alert',
          response.message || i18n.catalog["common.general.unableConfigureOperatingContext"],
          'error'
        );
        return;
      }
      await loadReadiness();
      setSetupOpen(false);
      showAlert('operating-context-alert', i18n.catalog["enterpriseCore.orgHierarchy.operatingContextConfiguredSuccessfully"], 'success');
    } catch (error) {
      console.error(i18n.catalog["common.general.unableConfigureOperatingContext"], error);
      showAlert('operating-context-alert', i18n.catalog["common.general.unableConfigureOperatingContext"], 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <div id="operating-context-alert" />
      <div className="settings-wrapper animate-fade">
        <div className="sales-card" style={{ marginBottom: '1rem' }}>
          <div className="card-header-flex">
            <div>
              <h3>{i18n.catalog["enterpriseCore.orgHierarchy.operationalStoreReadiness"]}</h3>
              {readiness?.ready ? (
                <p>{i18n.catalog["enterpriseCore.orgHierarchy.readyWarehouseDrivenSalesPurchasing"]}</p>
              ) : (
                <p>
                  {(readiness?.missing?.[0]?.key
                    ? readinessActions[readiness.missing[0].key]
                    : null) ||
                    i18n.catalog["enterpriseCore.orgHierarchy.configureWarehouseFinancialCentersPosTerminalBeginOperations"]}
                </p>
              )}
            </div>
            <Button
              variant={readiness?.ready ? 'secondary' : 'primary'}
              onClick={() => setSetupOpen(true)}
            >
              {readiness?.ready ? i18n.catalog["enterpriseCore.orgHierarchy.reviewOperatingContext"] : i18n.catalog["enterpriseCore.orgHierarchy.configureStore"]}
            </Button>
          </div>
          {readiness?.checks?.length ? (
            <div className="badge-container" style={{ marginTop: '0.75rem' }}>
              {readiness.checks.map((check) => (
                <span
                  key={check.key}
                  className={`badge ${check.complete ? 'badge-success' : 'badge-warning'}`}
                >
                  {readinessLabels[check.key] || i18n.catalog["common.general.readiness"]}: {check.complete
                    ? i18n.catalog["enterpriseCore.orgHierarchy.readinessReady"]
                    : i18n.catalog["common.general.required"]}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <TabNavigation
          tabs={[
            { key: 'dashboard', label: i18n.catalog["common.general.dashboard"], icon: 'dashboard' },
            { key: 'hierarchy', label: i18n.catalog["common.general.organizationalChart"], icon: 'tree' },
            { key: 'nodes', label: i18n.catalog["enterpriseCore.orgHierarchy.organizationalUnits"], icon: 'sitemap' },
            { key: 'links', label: i18n.catalog["common.general.links"], icon: 'link' },
            { key: 'meta_types', label: i18n.catalog["common.general.typesUnits"], icon: 'cube' },
            { key: 'topology_rules', label: i18n.catalog["common.general.linkingRules"], icon: 'route' },
            { key: 'scope_context', label: i18n.catalog["common.general.contextAnalysis"], icon: 'search' },
            { key: 'integrity', label: i18n.catalog["enterpriseCore.orgHierarchy.structuralSafety"], icon: 'check-shield' },
            { key: 'change_history', label: i18n.catalog["enterpriseCore.orgHierarchy.changeLog"], icon: 'history' },
          ]}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as OrgTab)}
        />
        <div>
          <OrganizationalStructure activeTab={activeTab} />
        </div>
      </div>

      <Dialog
        isOpen={setupOpen}
        onClose={() => !isSaving && setSetupOpen(false)}
        title={i18n.catalog["enterpriseCore.orgHierarchy.configureOperationalStore"]}
        maxWidth="760px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSetupOpen(false)} disabled={isSaving}>
              {i18n.catalog["common.general.cancel"]}
            </Button>
            <Button onClick={configureStore} isLoading={isSaving}>
              {i18n.catalog["enterpriseCore.orgHierarchy.saveOperatingContext"]}</Button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group">
            <label>{i18n.catalog["enterpriseCore.orgHierarchy.organizationalUnit"]}</label>
            <SearchableSelect
              options={nodeOptions}
              value={setupForm.org_node_uuid}
              onChange={(value) =>
                updateSetupField('org_node_uuid', typeof value === 'string' ? value : null)
              }
              placeholder={i18n.catalog["enterpriseCore.orgHierarchy.selectOperatingUnitOptional"]}
            />
          </div>
          <div className="form-group">
            <label>{i18n.catalog["enterpriseCore.orgHierarchy.costCenter"]}</label>
            <SearchableSelect
              options={costCenterOptions}
              value={setupForm.cost_center_id}
              onChange={(value) =>
                updateSetupField('cost_center_id', typeof value === 'number' ? value : null)
              }
              placeholder={i18n.catalog["enterpriseCore.orgHierarchy.selectActiveCostCenter"]}
              required
            />
          </div>
          <div className="form-group">
            <label>{i18n.catalog["enterpriseCore.orgHierarchy.profitCenter"]}</label>
            <SearchableSelect
              options={profitCenterOptions}
              value={setupForm.profit_center_id}
              onChange={(value) =>
                updateSetupField('profit_center_id', typeof value === 'number' ? value : null)
              }
              placeholder={i18n.catalog["enterpriseCore.orgHierarchy.selectActiveProfitCenter"]}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="warehouse-code">{i18n.catalog["enterpriseCore.orgHierarchy.warehouseCode"]}</label>
            <input
              id="warehouse-code"
              className="form-control"
              value={setupForm.warehouse_code}
              onChange={(event) => updateSetupField('warehouse_code', event.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="warehouse-name">{i18n.catalog["enterpriseCore.orgHierarchy.warehouseName"]}</label>
            <input
              id="warehouse-name"
              className="form-control"
              value={setupForm.warehouse_name}
              onChange={(event) => updateSetupField('warehouse_name', event.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="pos-code">{i18n.catalog["enterpriseCore.orgHierarchy.posTerminalCode"]}</label>
            <input
              id="pos-code"
              className="form-control"
              value={setupForm.pos_code}
              onChange={(event) => updateSetupField('pos_code', event.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="pos-name">{i18n.catalog["enterpriseCore.orgHierarchy.posTerminalName"]}</label>
            <input
              id="pos-name"
              className="form-control"
              value={setupForm.pos_name}
              onChange={(event) => updateSetupField('pos_name', event.target.value)}
            />
          </div>
        </div>
      </Dialog>
    </MainLayout>
  );
}

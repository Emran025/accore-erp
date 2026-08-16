'use client';

import { useI18n, catalogText, catalogMessage } from '@/lib/i18n';
import { MainLayout } from '@/components/layout';
import {
  Button,
  Dialog,
  Input,
  SearchableSelect,
  TabNavigation,
  type SelectOption,
  showAlert,
} from '@/components/ui';
import { fetchAPI } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useOperatingContextStore } from '@/stores/useOperatingContextStore';
import { useSetupStateStore } from '@/stores/useSetupStateStore';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SetupJourney } from '@/app/setup/components/SetupJourney';
import { OrganizationalStructure } from './OrganizationalStructure';
import { OperatingContextReadinessCard } from './components/OperatingContextReadinessCard';

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
  warehouse_name: catalogMessage('enterpriseCore.orgHierarchy.mainWarehouse'),
  pos_code: 'POS-MAIN',
  pos_name: catalogMessage('enterpriseCore.orgHierarchy.mainPos'),
};

function listFromResponse(response: any): any[] {
  const raw = response?.data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

export default function OrganizationalStructurePage() {
  const { t: i18n } = useI18n();
  const router = useRouter();
  const {
    activateReadyModules,
    isSaving: isActivatingModules,
    error: setupError,
  } = useSetupStateStore();
  const [isSetupFlow, setIsSetupFlow] = useState(false);
  const [activeTab, setActiveTab] = useState<OrgTab>('dashboard');
  const [setupOpen, setSetupOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [setupForm, setSetupForm] = useState<SetupForm>(initialSetupForm);
  const [nodes, setNodes] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [profitCenters, setProfitCenters] = useState<any[]>([]);
  const { readiness, contexts, isSelectingContext, loadReadiness, loadContexts, selectContext } =
    useOperatingContextStore();
  useEffect(() => {
    const setupMode = new URLSearchParams(window.location.search).get('setup') === '1';
    setIsSetupFlow(setupMode);
    if (setupMode) setActiveTab('nodes');
  }, []);

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
      await Promise.all([loadReadiness(), loadContexts()]);
    };
    loadSetupData();
  }, [loadContexts, loadReadiness]);

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
        label: catalogText(i18n, 'common.general.notAvailable.alternative10', {
          value0: center.code,
          value1: center.name,
        }),
        subtitle: center.name_en || '',
      })),
    [costCenters]
  );
  const profitCenterOptions = useMemo<SelectOption[]>(
    () =>
      profitCenters.map((center) => ({
        value: center.id,
        label: catalogText(i18n, 'common.general.notAvailable.alternative10', {
          value0: center.code,
          value1: center.name,
        }),
        subtitle: center.name_en || '',
      })),
    [profitCenters]
  );

  const updateSetupField = <K extends keyof SetupForm>(key: K, value: SetupForm[K]) => {
    setSetupForm((current) => ({ ...current, [key]: value }));
  };

  const changeOperatingContext = async (value: string | number | null) => {
    if (typeof value !== 'number') return;

    const selected = await selectContext(value);
    if (!selected) {
      showAlert(
        'operating-context-alert',
        i18n.catalog['state.useoperatingcontextstore.unableSelectOperatingContext'],
        'error'
      );
    }
  };

  const activateReadySetupModules = async () => {
    const setupState = await activateReadyModules();
    if (!setupState) return;

    if (setupState.pending_module_setup) {
      showAlert(
        'operating-context-alert',
        i18n.catalog['enterpriseCore.orgHierarchy.selectedModulesNeedOrganizationalSetup'],
        'error'
      );
      return;
    }

    router.replace('/navigation');
  };

  const configureStore = async () => {
    if (
      !setupForm.org_node_uuid ||
      !setupForm.cost_center_id ||
      !setupForm.profit_center_id ||
      !setupForm.warehouse_code ||
      !setupForm.warehouse_name ||
      !setupForm.pos_code ||
      !setupForm.pos_name
    ) {
      showAlert(
        'operating-context-alert',
        i18n.catalog[
          'enterpriseCore.orgHierarchy.pleaseCompleteRequiredOperatingConfigurationFields'
        ],
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
          system_default: isSetupFlow,
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
          response.message || i18n.catalog['common.general.unableConfigureOperatingContext'],
          'error'
        );
        return;
      }
      await Promise.all([loadReadiness(), loadContexts()]);
      setSetupOpen(false);
      showAlert(
        'operating-context-alert',
        i18n.catalog['enterpriseCore.orgHierarchy.operatingContextConfiguredSuccessfully'],
        'success'
      );
    } catch (error) {
      console.error(i18n.catalog['common.general.unableConfigureOperatingContext'], error);
      showAlert(
        'operating-context-alert',
        i18n.catalog['common.general.unableConfigureOperatingContext'],
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout allowIncompleteSetup={isSetupFlow}>
      <div id="operating-context-alert" />
      <div className="settings-wrapper animate-fade">
        {isSetupFlow ? <SetupJourney activeStep="organization" completedSteps={['scope']} /> : null}
        <OperatingContextReadinessCard
          isSetupFlow={isSetupFlow}
          readiness={readiness}
          contexts={contexts}
          isSelectingContext={isSelectingContext}
          isActivatingModules={isActivatingModules}
          setupError={setupError}
          onConfigure={() => setSetupOpen(true)}
          onStartModuleSetup={() => router.push('/setup?continue=1')}
          onActivateReadyModules={() => void activateReadySetupModules()}
          onSelectContext={(value) => void changeOperatingContext(value)}
        />

        {isSetupFlow ? (
          <OrganizationalStructure activeTab="nodes" isSetupFlow />
        ) : (
          <>
            <TabNavigation
              tabs={[
                {
                  key: 'dashboard',
                  label: i18n.catalog['common.general.dashboard'],
                  icon: 'dashboard',
                },
                {
                  key: 'hierarchy',
                  label: i18n.catalog['common.general.organizationalChart'],
                  icon: 'tree',
                },
                {
                  key: 'nodes',
                  label: i18n.catalog['enterpriseCore.orgHierarchy.organizationalUnits'],
                  icon: 'sitemap',
                },
                { key: 'links', label: i18n.catalog['common.general.links'], icon: 'link' },
                {
                  key: 'meta_types',
                  label: i18n.catalog['common.general.typesUnits'],
                  icon: 'cube',
                },
                {
                  key: 'topology_rules',
                  label: i18n.catalog['common.general.linkingRules'],
                  icon: 'route',
                },
                {
                  key: 'scope_context',
                  label: i18n.catalog['common.general.contextAnalysis'],
                  icon: 'search',
                },
                {
                  key: 'integrity',
                  label: i18n.catalog['enterpriseCore.orgHierarchy.structuralSafety'],
                  icon: 'check-shield',
                },
                {
                  key: 'change_history',
                  label: i18n.catalog['enterpriseCore.orgHierarchy.changeLog'],
                  icon: 'history',
                },
              ]}
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab as OrgTab)}
            />
            <div>
              <OrganizationalStructure activeTab={activeTab} />
            </div>
          </>
        )}
      </div>

      <Dialog
        isOpen={setupOpen}
        onClose={() => !isSaving && setSetupOpen(false)}
        title={i18n.catalog['enterpriseCore.orgHierarchy.configureOperationalStore']}
        maxWidth="760px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSetupOpen(false)} disabled={isSaving}>
              {i18n.catalog['common.general.cancel']}
            </Button>
            <Button onClick={configureStore} isLoading={isSaving}>
              {i18n.catalog['enterpriseCore.orgHierarchy.saveOperatingContext']}
            </Button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group">
            <label>{i18n.catalog['enterpriseCore.orgHierarchy.organizationalUnit']}</label>
            <SearchableSelect
              options={nodeOptions}
              value={setupForm.org_node_uuid}
              onChange={(value) =>
                updateSetupField('org_node_uuid', typeof value === 'string' ? value : null)
              }
              placeholder={i18n.catalog['enterpriseCore.orgHierarchy.organizationalUnit']}
            />
          </div>
          <div className="form-group">
            <label>{i18n.catalog['enterpriseCore.orgHierarchy.costCenter']}</label>
            <SearchableSelect
              options={costCenterOptions}
              value={setupForm.cost_center_id}
              onChange={(value) =>
                updateSetupField('cost_center_id', typeof value === 'number' ? value : null)
              }
              placeholder={i18n.catalog['enterpriseCore.orgHierarchy.selectActiveCostCenter']}
              required
            />
          </div>
          <div className="form-group">
            <label>{i18n.catalog['enterpriseCore.orgHierarchy.profitCenter']}</label>
            <SearchableSelect
              options={profitCenterOptions}
              value={setupForm.profit_center_id}
              onChange={(value) =>
                updateSetupField('profit_center_id', typeof value === 'number' ? value : null)
              }
              placeholder={i18n.catalog['enterpriseCore.orgHierarchy.selectActiveProfitCenter']}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="warehouse-code">
              {i18n.catalog['enterpriseCore.orgHierarchy.warehouseCode']}
            </label>
            <Input
              id="warehouse-code"
              className="form-control"
              value={setupForm.warehouse_code}
              onChange={(event) => updateSetupField('warehouse_code', event.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="warehouse-name">
              {i18n.catalog['enterpriseCore.orgHierarchy.warehouseName']}
            </label>
            <Input
              id="warehouse-name"
              className="form-control"
              value={setupForm.warehouse_name}
              onChange={(event) => updateSetupField('warehouse_name', event.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="pos-code">
              {i18n.catalog['enterpriseCore.orgHierarchy.posTerminalCode']}
            </label>
            <Input
              id="pos-code"
              className="form-control"
              value={setupForm.pos_code}
              onChange={(event) => updateSetupField('pos_code', event.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="pos-name">
              {i18n.catalog['enterpriseCore.orgHierarchy.posTerminalName']}
            </label>
            <Input
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

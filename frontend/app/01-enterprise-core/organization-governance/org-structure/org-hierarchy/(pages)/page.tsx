'use client';

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
  warehouse_name: 'Main Warehouse',
  pos_code: 'POS-MAIN',
  pos_name: 'Main POS',
};

function listFromResponse(response: any): any[] {
  const raw = response?.data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

export default function OrganizationalStructurePage() {
  const [activeTab, setActiveTab] = useState<OrgTab>('dashboard');
  const [setupOpen, setSetupOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [setupForm, setSetupForm] = useState<SetupForm>(initialSetupForm);
  const [nodes, setNodes] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [profitCenters, setProfitCenters] = useState<any[]>([]);
  const { readiness, loadReadiness } = useOperatingContextStore();

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
        label: `${center.code} — ${center.name}`,
        subtitle: center.name_en || '',
      })),
    [costCenters]
  );
  const profitCenterOptions = useMemo<SelectOption[]>(
    () =>
      profitCenters.map((center) => ({
        value: center.id,
        label: `${center.code} — ${center.name}`,
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
        'Please complete the required operating configuration fields.',
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
          response.message || 'Unable to configure the operating context.',
          'error'
        );
        return;
      }
      await loadReadiness();
      setSetupOpen(false);
      showAlert('operating-context-alert', 'Operating context configured successfully.', 'success');
    } catch (error) {
      console.error('Unable to configure the operating context.', error);
      showAlert('operating-context-alert', 'Unable to configure the operating context.', 'error');
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
              <h3>Operational Store Readiness</h3>
              {readiness?.ready ? (
                <p>Ready for warehouse-driven sales and purchasing.</p>
              ) : (
                <p>
                  {readiness?.missing?.[0]?.action ||
                    'Configure a warehouse, financial centers, and POS terminal to begin operations.'}
                </p>
              )}
            </div>
            <Button
              variant={readiness?.ready ? 'secondary' : 'primary'}
              onClick={() => setSetupOpen(true)}
            >
              {readiness?.ready ? 'Review Operating Context' : 'Configure Store'}
            </Button>
          </div>
          {readiness?.checks?.length ? (
            <div className="badge-container" style={{ marginTop: '0.75rem' }}>
              {readiness.checks.map((check) => (
                <span
                  key={check.key}
                  className={`badge ${check.complete ? 'badge-success' : 'badge-warning'}`}
                >
                  {check.key.replaceAll('_', ' ')}: {check.complete ? 'ready' : 'required'}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <TabNavigation
          tabs={[
            { key: 'dashboard', label: 'لوحة التحكم', icon: 'dashboard' },
            { key: 'hierarchy', label: 'الشجرة التنظيمية', icon: 'tree' },
            { key: 'nodes', label: 'الوحدات التنظيمية', icon: 'sitemap' },
            { key: 'links', label: 'الارتباطات', icon: 'link' },
            { key: 'meta_types', label: 'أنواع الوحدات', icon: 'cube' },
            { key: 'topology_rules', label: 'قواعد الارتباط', icon: 'route' },
            { key: 'scope_context', label: 'تحليل السياق', icon: 'search' },
            { key: 'integrity', label: 'سلامة الهيكل', icon: 'check-shield' },
            { key: 'change_history', label: 'سجل التغييرات', icon: 'history' },
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
        title="Configure operational store"
        maxWidth="760px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSetupOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={configureStore} isLoading={isSaving}>
              Save operating context
            </Button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group">
            <label>Organizational unit</label>
            <SearchableSelect
              options={nodeOptions}
              value={setupForm.org_node_uuid}
              onChange={(value) =>
                updateSetupField('org_node_uuid', typeof value === 'string' ? value : null)
              }
              placeholder="Select operating unit (optional)"
            />
          </div>
          <div className="form-group">
            <label>Cost center *</label>
            <SearchableSelect
              options={costCenterOptions}
              value={setupForm.cost_center_id}
              onChange={(value) =>
                updateSetupField('cost_center_id', typeof value === 'number' ? value : null)
              }
              placeholder="Select an active cost center"
              required
            />
          </div>
          <div className="form-group">
            <label>Profit center *</label>
            <SearchableSelect
              options={profitCenterOptions}
              value={setupForm.profit_center_id}
              onChange={(value) =>
                updateSetupField('profit_center_id', typeof value === 'number' ? value : null)
              }
              placeholder="Select an active profit center"
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="warehouse-code">Warehouse code *</label>
            <input
              id="warehouse-code"
              className="form-control"
              value={setupForm.warehouse_code}
              onChange={(event) => updateSetupField('warehouse_code', event.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="warehouse-name">Warehouse name *</label>
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
            <label htmlFor="pos-code">POS terminal code *</label>
            <input
              id="pos-code"
              className="form-control"
              value={setupForm.pos_code}
              onChange={(event) => updateSetupField('pos_code', event.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="pos-name">POS terminal name *</label>
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

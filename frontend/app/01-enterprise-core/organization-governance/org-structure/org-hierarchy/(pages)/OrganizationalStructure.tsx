'use client';

import { ChangeHistoryTab } from '../components/ChangeHistoryTab';
import { DashboardTab } from '../components/DashboardTab';
import { HierarchyTab } from '../components/HierarchyTab';
import { IntegrityTab } from '../components/IntegrityTab';
import { LinksTab } from '../components/LinksTab';
import { MetaTypesTab } from '../components/MetaTypesTab';
import { NodesTab } from '../components/NodesTab';
import { ScopeContextTab } from '../components/ScopeContextTab';
import { TopologyRulesTab } from '../components/TopologyRulesTab';

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

interface Props {
  activeTab: OrgTab;
  isSetupFlow?: boolean;
}

export function OrganizationalStructure({ activeTab, isSetupFlow = false }: Props) {
  switch (activeTab) {
    case 'dashboard':
      return <DashboardTab />;
    case 'hierarchy':
      return <HierarchyTab />;
    case 'nodes':
      return <NodesTab isSetupFlow={isSetupFlow} />;
    case 'links':
      return <LinksTab />;
    case 'meta_types':
      return <MetaTypesTab />;
    case 'topology_rules':
      return <TopologyRulesTab />;
    case 'scope_context':
      return <ScopeContextTab />;
    case 'integrity':
      return <IntegrityTab />;
    case 'change_history':
      return <ChangeHistoryTab />;
    default:
      return <DashboardTab />;
  }
}

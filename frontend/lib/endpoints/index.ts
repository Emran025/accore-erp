import { AUTH } from './auth';
import { ENTERPRISE_CORE } from './enterprise-core';
import { COMMERCIAL } from './commercial';
import { FINANCE } from './finance';
import { SUPPLY_CHAIN } from './supply-chain';
import { MANUFACTURING } from './manufacturing';
import { HUMAN_CAPITAL } from './human-capital';
import { PROJECTS } from './projects';
import { ASSETS } from './assets';
import { INTELLIGENCE } from './intelligence';
import { PLATFORM } from './platform';

export type { AuthEndpoints } from './auth';
export type { EnterpriseCoreEndpoints } from './enterprise-core';
export type { CommercialEndpoints } from './commercial';
export type { FinanceEndpoints } from './finance';
export type { SupplyChainEndpoints } from './supply-chain';
export type { HumanCapitalEndpoints } from './human-capital';
export type { AssetsEndpoints } from './assets';
export type { IntelligenceEndpoints } from './intelligence';
export type { PlatformEndpoints } from './platform';

export const API_ENDPOINTS = {
    AUTH,
    ENTERPRISE_CORE,
    COMMERCIAL,
    FINANCE,
    SUPPLY_CHAIN,
    MANUFACTURING,
    HUMAN_CAPITAL,
    PROJECTS,
    ASSETS,
    INTELLIGENCE,
    PLATFORM,
} as const;

# Replit Prompt: Frontend API V2 Refactoring

## 📦 Objective
Refactor the current centralized [frontend/lib/endpoints.ts](file:///c:/xampp/htdocs/accsystem/frontend/lib/endpoints.ts) file into a modular, domain-driven directory structure in `frontend/lib/endpoints/`. All endpoints must be updated to reference the **V2** backend routes (prefixed with `/v2/`).

## 📂 Targeted Structure
Create the following directory and files in `frontend/lib/`:

```
endpoints/
├── index.ts           # Central export aggregating all domains
├── auth.ts            # Domain 00
├── enterprise-core.ts # Domain 01 (IAM, Org, Governance, Settings)
├── commercial.ts      # Domain 02 (Sales, Procurement, CRM)
├── finance.ts         # Domain 03 (GL, COA, Treasury, Tax)
├── supply-chain.ts    # Domain 04 (Inventory)
├── manufacturing.ts   # Domain 05 (Placeholder)
├── human-capital.ts   # Domain 06 (HR & Payroll)
├── projects.ts        # Domain 07 (Placeholder)
├── assets.ts          # Domain 08 (Asset Management)
├── intelligence.ts    # Domain 09 (Reports & Dashboard)
└── platform.ts        # Domain 10 (Automation & Compliance)
```

## 🛠️ Step-by-Step Instructions

### 1. Define Domain Files
Each file must export a strongly-typed constant following a naming convention that matches its filename (e.g., `auth.ts` exports `AUTH`).
- Use `/v2/` prefix for **all** paths.
- Preserve all functional/dynamic endpoints (e.g., methods taking `id`).
- Add TypeScript interfaces for each domain to ensure type safety.

### 2. Migration Mapping Matrix
Map the existing `API_ENDPOINTS` values to the new domain structure. **Note:** Some routes in V2 have gained sub-prefixes like `/treasury/` or `/operations/` based on backend `03-finance.php` and others. Ensure paths match the audited V2 backend routes.

| Old Label (V1) | New Label (V2) | Target File | Path Change Reminder |
| :--- | :--- | :--- | :--- |
| `AUTH.*` | `AUTH.*` | `auth.ts` | `/v2/login` etc |
| `SYSTEM.SETTINGS` | `ENTERPRISE_CORE.SETTINGS` | `enterprise-core.ts` | `/v2/settings` |
| `SYSTEM.ORG_STRUCTURE` | `ENTERPRISE_CORE.ORG` | `enterprise-core.ts` | `/v2/org` |
| `SYSTEM.USERS` | `ENTERPRISE_CORE.IAM.USERS` | `enterprise-core.ts` | `/v2/users` |
| `SYSTEM.TAX_ENGINE` | `FINANCE.TAX_ENGINE` | `finance.ts` | `/v2/tax-engine` |
| `FINANCE.GL` | `FINANCE.GENERAL_LEDGER` | `finance.ts` | `/v2/trial-balance` etc |
| `FINANCE.JOURNAL_VOUCHERS` | `FINANCE.TREASURY.VOUCHERS` | `finance.ts` | `/v2/treasury/...` |
| `FINANCE.CURRENCIES` | `FINANCE.FOREIGN_EXCHANGE.CURRENCIES`| `finance.ts` | `/v2/foreign-exchange/currencies` |
| `HR.*` | `HUMAN_CAPITAL.*` | `human-capital.ts` | `/v2/employees` etc |
| `INVENTORY.*` | `SUPPLY_CHAIN.*` | `supply-chain.ts` | `/v2/inventory/...` |
| `SALES.ZATCA` | `COMMERCIAL.SALES.ZATCA` | `commercial.ts` | `/v2/sales/zatca` |
| `REPORTS.*` | `INTELLIGENCE.REPORTS.*` | `intelligence.ts` | `/v2/analytics/reports/...` |
| `REPORTS.DASHBOARD` | `INTELLIGENCE.DASHBOARD` | `intelligence.ts` | `/v2/analytics/dashboard` |

### 3. Create Unified Exporter (`index.ts`)
Synthesize all domain exports into a single `API_ENDPOINTS` object:
```typescript
import { AUTH } from './auth';
import { ENTERPRISE_CORE } from './enterprise-core';
// ... etc

export const API_ENDPOINTS = {
  AUTH,
  ENTERPRISE_CORE,
  COMMERCIAL,
  FINANCE,
  SUPPLY_CHAIN,
  HUMAN_CAPITAL,
  ASSETS,
  INTELLIGENCE,
  PLATFORM,
} as const;
```

### 4. Global Codebase Replacement
Search and replace all occurrences of `API_ENDPOINTS` usage in the codebase to match the new hierarchical structure.
- **Example:** Replace `API_ENDPOINTS.SYSTEM.ORG_STRUCTURE` with `API_ENDPOINTS.ENTERPRISE_CORE.ORG`.
- **Example:** Replace `API_ENDPOINTS.HR` with `API_ENDPOINTS.HUMAN_CAPITAL`.

## ✅ Verification Protocol
After refactoring, Replit should:
1. **Lint Check**: Run `npm run lint` or equivalent to ensure no broken references.
2. **Path Verification**: Ensure all paths now start with `/v2/`.
3. **Double-Slash Check**: Ensure no endpoints result in `//v2/` (fix leading slashes if necessary).
4. **Interface Validation**: Check that all TS interfaces correctly describe the objects.

## 🚀 Migration Script (Pseudo-code for Replit)
```javascript
// High-level migration logic
const replaceInFile = (file, oldPattern, newPattern) => {
  // Global regex replacement
};

// Execute across components, pages, and hooks
["src/components", "src/pages", "src/hooks"].forEach(dir => {
  // Update labels to V2 hierarchy
});
```

# Frontend API V2 Refactor Plan

## 1. Directory Structure
Create a new directory `frontend/lib/endpoints/` to hold domain-specific endpoint definitions.

```
frontend/lib/endpoints/
├── index.ts           # Unified export point
├── auth.ts            # Authentication (Domain 00)
├── enterprise-core.ts # IAM, Org, Governance (Domain 01)
├── commercial.ts      # Sales, CRM, Procurement (Domain 02)
├── finance.ts         # GL, COA, Treasury, Tax (Domain 03)
├── supply-chain.ts    # Inventory (Domain 04)
├── manufacturing.ts   # Placeholder (Domain 05)
├── human-capital.ts   # HR & Payroll (Domain 06)
├── projects.ts        # Placeholder (Domain 07)
├── assets.ts          # Asset Management (Domain 08)
├── intelligence.ts    # Reports & Analytics (Domain 09)
└── platform.ts        # Digital Infrastructure/Automation (Domain 10)
```

## 2. Global v2 Prefixing
All endpoints will now be prefixed with `/v2/` to align with the backend's new route group.

## 3. Domain-Specific Interfaces
Each file will export:
- An interface defining the structure of the domain endpoints.
- A constant object implementing that interface.

Example `auth.ts`:
```typescript
export interface AuthEndpoints {
  LOGIN: string;
  LOGOUT: string;
  CHECK: string;
}

export const AUTH: AuthEndpoints = {
  LOGIN: "/v2/login",
  LOGOUT: "/v2/logout",
  CHECK: "/v2/check",
};
```

## 4. Unified Export (`index.ts`)
The `index.ts` will aggregate all domains into a single `API_ENDPOINTS` object to maintain a clean API for the rest of the application.

```typescript
import { AUTH } from './auth';
import { ENTERPRISE_CORE } from './enterprise-core';
// ... other imports

export const API_ENDPOINTS = {
    AUTH,
    ENTERPRISE_CORE,
    // ...
} as const;
```

## 5. Codebase Migration (Usage Mapping)
A script or global replacement strategy will be used to update existing calls.
- `API_ENDPOINTS.SYSTEM.ORG_STRUCTURE` -> `API_ENDPOINTS.ENTERPRISE_CORE.ORG_STRUCTURE`
- `API_ENDPOINTS.HR` -> `API_ENDPOINTS.HUMAN_CAPITAL`
- `API_ENDPOINTS.SALES` -> `API_ENDPOINTS.COMMERCIAL.SALES`
- `API_ENDPOINTS.PURCHASES` -> `API_ENDPOINTS.COMMERCIAL.PURCHASES`
- `API_ENDPOINTS.REPORTS` -> `API_ENDPOINTS.INTELLIGENCE.REPORTS`

## 6. Verification
- Verify that every V1 endpoint has a V2 equivalent.
- Ensure all dynamic functions (e.g., [(id) => ...](file:///c:/xampp/htdocs/accsystem/backend/app/Domains/EnterpriseCore/IdentityAccess/Services/PermissionService.php#89-113)) are preserved and updated with `/v2/`.
- Validate that [fetchAPI](file:///c:/xampp/htdocs/accsystem/frontend/lib/api.ts#52-134) in [api.ts](file:///c:/xampp/htdocs/accsystem/frontend/lib/api.ts) handles the dual `/api` and `/v2` prefixing correctly (it currently removes `/api/` if present, so `/v2/...` becomes `API_BASE/v2/...` which is correct).

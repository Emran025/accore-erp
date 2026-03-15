# API V2 Label Migration Logic

This document provides the high-level logic and code required to transition the frontend codebase from the V1 `API_ENDPOINTS` structure to the V2 domain-driven structure.

## 1. Migration Helper Script (Node.js/TS)

This script can be used to perform a global search-and-replace across the codebase.

```typescript
import * as fs from 'fs';
import * as path from 'path';

const MAPPINGS = {
  'API_ENDPOINTS.SYSTEM.SETTINGS': 'API_ENDPOINTS.ENTERPRISE_CORE.SETTINGS',
  'API_ENDPOINTS.SYSTEM.ORG_STRUCTURE': 'API_ENDPOINTS.ENTERPRISE_CORE.ORG',
  'API_ENDPOINTS.SYSTEM.USERS': 'API_ENDPOINTS.ENTERPRISE_CORE.IAM.USERS',
  'API_ENDPOINTS.SYSTEM.TEMPLATES': 'API_ENDPOINTS.ENTERPRISE_CORE.AUTOMATION.TEMPLATES',
  'API_ENDPOINTS.SYSTEM.TAX_ENGINE': 'API_ENDPOINTS.FINANCE.TAX_ENGINE',
  'API_ENDPOINTS.FINANCE.GL': 'API_ENDPOINTS.FINANCE.GENERAL_LEDGER',
  'API_ENDPOINTS.HR': 'API_ENDPOINTS.HUMAN_CAPITAL',
  'API_ENDPOINTS.INVENTORY': 'API_ENDPOINTS.SUPPLY_CHAIN',
  'API_ENDPOINTS.SALES': 'API_ENDPOINTS.COMMERCIAL.SALES',
  'API_ENDPOINTS.PURCHASES': 'API_ENDPOINTS.COMMERCIAL.PROCUREMENT',
  'API_ENDPOINTS.REPORTS': 'API_ENDPOINTS.INTELLIGENCE.REPORTS',
};

function migrateDirectory(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      migrateDirectory(fullPath);
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const [v1, v2] of Object.entries(MAPPINGS)) {
        if (content.includes(v1)) {
          content = content.split(v1).join(v2);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}
```

## 2. Updated Usage Examples

### Previous (V1)
```typescript
import { API_ENDPOINTS } from '@/lib/endpoints';

const fetchEmployees = () => fetchAPI(API_ENDPOINTS.HR.EMPLOYEES.BASE);
const getOrgNodes = () => fetchAPI(API_ENDPOINTS.SYSTEM.ORG_STRUCTURE.NODES);
```

### New (V2)
```typescript
import { API_ENDPOINTS } from '@/lib/endpoints';

// Structure is now domain-aligned and type-safe
const fetchEmployees = () => fetchAPI(API_ENDPOINTS.HUMAN_CAPITAL.EMPLOYEES.BASE);
const getOrgNodes = () => fetchAPI(API_ENDPOINTS.ENTERPRISE_CORE.ORG.NODES);
```

## 3. Backward Compatibility Layer (Optional)
If a gradual migration is required, the `index.ts` can include a deprecated getter proxy to warn developers during development.

```typescript
export const API_ENDPOINTS = {
  // New domains
  AUTH,
  ENTERPRISE_CORE,
  // ...
  
  // Backward compatibility proxy (Deprecated)
  get SYSTEM() {
    console.warn("API_ENDPOINTS.SYSTEM is deprecated. Use ENTERPRISE_CORE or PLATFORM.");
    return {
       ORG_STRUCTURE: ENTERPRISE_CORE.ORG,
       // ...
    };
  }
} as const;
```

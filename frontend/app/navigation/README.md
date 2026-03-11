# Navigation Screen

## Overview

The primary responsive grid that displays available navigation modules and screens to users, respecting their RBAC permissions. Handles routing between nested navigation groups or external module paths.

## Route

```
/navigation
```

## Structure

```
navigation/
├── (pages)/
│   └── page.tsx                ← Server entry orchestrator
├── components/
│   └── NavigationGridContent.tsx ← Client component for querying current group
├── hooks/                      ← Future: useNavigationSearch, etc.
├── services/                   ← Future: client-side fetchers
├── index.ts                    ← Public barrel export
└── README.md                   ← This file
```

## Dependencies

- `@/lib/navigation` — Domain configuration access
- `@/components/navigation` — Visual navigation elements (cards, grids)
- `@/stores/useAuthStore` — Validating user clearance for modules

# Login Screen

## Overview

Authentication entry point for the ERP platform. Validates user credentials
and redirects to the global dashboard on success.

## Route

```
/auth/login
```

## Structure

```
login/
├── (pages)/
│   └── page.tsx          ← Server entry (re-exports from index)
├── components/
│   └── LoginForm.tsx     ← Client form with username/password
├── hooks/                ← Future: useLoginForm, useOAuth
├── services/             ← Future: auth service wrappers
├── index.ts              ← Public barrel export
└── README.md             ← This file
```

## Dependencies

- `@/lib/auth` — `login()` function
- `@/components/ui` — Button, Alert, TextInput, PasswordInput
- `@/stores/useAuthStore` — Auth state management

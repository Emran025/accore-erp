# Complete Interface Localization Program

**Status:** Completed and verified

## Objective

The ERP contains a large and distributed interface surface. Its localization model must therefore be based on deterministic source inventory and verification rather than a manually maintained shortlist of labels. This program extracts every candidate user-visible literal from the frontend source, maps each eligible literal to a stable bilingual catalog entry, rewrites consuming source to use the locale runtime, and blocks any new unmanaged interface text in continuous integration.

## Scope and policy

The scanner covers TypeScript and TSX source under `frontend/app`, `frontend/components`, `frontend/lib`, and `frontend/stores`. It recognizes rendered JSX text, user-facing JSX attributes, named interface object properties, dialog and notification messages, and interpolated template literals. It explicitly excludes technical syntax such as imports, routes, API paths, object keys, type guards, CSS values, icon identifiers, client directives, parser MIME types, sample non-interface data, and dynamic class tokens.

| Artifact | Responsibility |
|---|---|
| `frontend/i18n/inventory-policy.json` | Defines scope, candidate contexts, and approved technical exclusions. |
| `frontend/scripts/i18n-inventory.ts` | AST inventory and zero-pending gate. |
| `frontend/scripts/i18n-build-catalog.ts` | Deduplicates source copy and retains all source locations. |
| `frontend/scripts/i18n-build-dictionaries.ts` | Generates immutable Arabic and English catalog modules. |
| `frontend/scripts/i18n-extract-components.ts` | Migrates client-rendered component text through `useI18n()`. |
| `frontend/scripts/i18n-extract-runtime.ts` | Migrates server, configuration, and store text through `catalogMessage()`. |
| `frontend/scripts/i18n-verify-coverage.ts` | Produces the complete per-file verification ledger. |

## Runtime design

The locale platform provides a typed `AppDictionary`, `ar-SA` and `en-US` locale metadata, immutable dictionaries, locale persistence, RTL/LTR document state, locale-aware number/date/currency formatting, a client hook, and a server-safe non-hook catalog accessor. Every generated catalog key is opaque and stable; source text is never used as a runtime key.

Client-rendered components access catalog copy through `useI18n()` and `i18n.catalog`. Server components, navigation configuration, and stores use `catalogMessage()`. Dynamic messages preserve source expressions using `catalogText()` with named placeholder values. This division prevents hooks from being introduced into server code or module-level configuration.

## Dictionary coverage

The baseline source catalog contains **3,972 unique non-technical interface entries** in Arabic and English. The catalog is generated as typed locale modules and parity is enforced by TypeScript and dedicated tests.

## Verification standard

The acceptance gate is intentionally strict:

> A scanned file passes only when it has zero `pending` text candidates. Every candidate must be extracted, technically excluded by policy, or formally approved as an exception.

The final generated coverage ledger is available at `frontend/i18n/inventory/coverage.md` and `frontend/i18n/inventory/coverage.json`. It records **466 scanned files**, **27,492 candidate literals**, **466 passing files**, and **0 failing files**.

## Commands

| Command | Purpose |
|---|---|
| `npm run i18n:inventory` | Refresh the AST inventory and human-readable report. |
| `npm run i18n:check` | Fail if any scanned candidate remains pending. |
| `npm run i18n:coverage` | Generate and verify the per-file coverage ledger. |
| `npm test -- --run` | Verify typed locale parity and all existing frontend behavior. |
| `npm run build` | Type-check and build all extracted runtime references. |

The CI workflow runs `npm run i18n:check` as a blocking quality gate before the frontend production build.

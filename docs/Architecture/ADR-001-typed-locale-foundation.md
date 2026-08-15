# ADR-001: Typed Locale Foundation

**Status:** Superseded in part by ADR-002
**Date:** 2026-08-15
**Decision owner:** Frontend architecture

## Context

The application previously exposed one flat Arabic-only translation object through a string-key helper. The helper was not suitable for a bilingual ERP because it could not enforce Arabic/English parity, did not provide locale metadata or formatting, and could render an internal key when a translation was missing.

## Decision

The application now has a single typed locale foundation under `frontend/lib/i18n`. It supports `ar-SA` and `en-US` and exposes locale metadata, immutable nested dictionaries, a safe server/client loader, `LocaleProvider`, and the `useI18n()` hook.

| Concern | Decision |
|---|---|
| Canonical contract | `AppDictionary` is the source of truth for all UI text. Locale dictionaries use `satisfies AppDictionary`, so TypeScript rejects missing keys, incompatible nested structure, and parameter mismatch. Generated catalog entries use descriptive semantic labels under ADR-002. |
| Locale metadata | Each supported locale defines an IETF language tag, direction, formatting locale, approved font stack, display name, and explicit fallback relation. |
| UI consumption | New components access `useI18n().t.namespace.property`; they must not import a language-specific dictionary or call a string-key helper. |
| Parameterized messages | Parameterized content is expressed as typed functions in the dictionary. This keeps required values explicit and prevents runtime placeholder errors. |
| Formatting | `useI18n().format` is the shared gateway for numbers, currency, and dates. Future expansion belongs there rather than in component-local locale literals. |
| Direction and fonts | `LocaleProvider` maintains document `lang`, `dir`, and `--app-font-family` from metadata. |
| Missing translations | The runtime uses a supported dictionary fallback and records a deduplicated development diagnostic. It never renders an internal key as user-visible output. |
| Persistence | The provider safely persists explicit client locale choice in local storage. Profile and device resolution remain the next implementation phase under issue #28. |
| Legacy utility | `frontend/lib/translations.ts` remains a deprecated migration source. Its raw-key fallback has been replaced with a safe Arabic message; new imports are prohibited by convention pending automated guardrails in issue #29. |

## Namespace ownership

The dictionary uses bounded namespace families: `common`, `auth`, `dashboard`, `sales`, `inventory`, `procurement`, `expenses`, `users`, `settings`, `feedback`, `pagination`, `finance`, `permissions`, `sessions`, `reports`, `dates`, `units`, `analytics`, `operations`, `messages`, and `accessibility`.

A domain team owns its corresponding business namespace. Shared application primitives own `common`, `feedback`, `pagination`, and `accessibility`. A text move into a shared namespace is allowed only when its meaning and review ownership are identical across domains.

## Consequences

The foundation provides a compile-time safe bilingual contract. ADR-002 supersedes its earlier opaque generated-key strategy and defines language-aware endpoint responses and persisted localized-data boundaries. Device/profile locale resolution, broader validation contracts, and automated literal guardrails remain incremental follow-up work.

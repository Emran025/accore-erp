# ADR-002: Semantic Localization Keys and API Language Contract

**Status:** Accepted  
**Date:** 2026-08-15  
**Decision owner:** Application architecture

## Context

The first localization rollout proved dictionary completeness but used opaque generated identifiers such as `text_…`. Those identifiers are stable for machines but not understandable to developers, reviewers, or domain teams. The system also contains language-bearing output outside React components: server success and error messages, validation output, printable documents, system-authored records, and user-authored business content returned by API resources.

A UI dictionary alone cannot localize all endpoint data. Interface labels are owned by application code, while stored names, descriptions, templates, and comments are domain data with their own authorship and translation lifecycle. Treating either category as the other produces incorrect fallback behavior and makes changes unsafe.

## Decision

The application uses **descriptive dot-path keys** in the form `scope.feature.intent`. Each segment is English, lower camel case, and describes ownership and purpose rather than a source-language phrase or a generated hash. Examples include `finance.zatcaSettings.authorityTechnicalAccessPolicySavedSuccessfully`, `commercial.quotation.newQuotation`, and `common.general.confirm`.

| Content category | Canonical owner | Required representation | API behavior |
|---|---|---|---|
| Static interface copy | Frontend locale catalog | Descriptive semantic key with Arabic and English values | Resources return data only; they do not return UI labels. |
| Endpoint outcome message | Backend `lang/{locale}/api.php` | Semantic `message_key` such as `api.error.forbidden`, plus a localized `message` | The server negotiates locale once per request and returns both the chosen-language message and its stable key. |
| Validation message | Laravel language files | Laravel validation key and localized replacement data | The server returns the selected-language validation text; a future structured error code may supplement it. |
| System-authored domain field | Domain model and resource | Explicit translated field, for example `name_ar` and `name_en`, or a validated locale-keyed JSON object | Resource selects `name` for the negotiated locale and may expose `translations` only when requested. |
| User-authored content | Domain model | Original language plus optional managed translations, never a UI dictionary entry | Preserve the original content and language; translate only through an approved business workflow. |

> **Rule:** A value belongs in a dictionary only when the application owns its wording. A value belongs in persistent localized domain data when a business user, customer, supplier, or external system owns it.

## HTTP and request contract

The frontend sends both `Accept-Language` and `X-Accore-Locale` on every API request. `X-Accore-Locale` represents an explicit in-application choice and has precedence over the browser preference. The backend accepts `ar`, `ar-SA`, `en`, and `en-US`, resolves to its supported application locale, and sets the Laravel locale before authentication, controllers, resources, and validation execute.

The response returns `Content-Language`, appends `Accept-Language, X-Accore-Locale` to `Vary`, and includes the resolved locale in `meta`. This follows HTTP content negotiation: `Accept-Language` communicates client preferences, while `Content-Language` communicates the selected representation audience.[1][2]

```json
{
  "success": false,
  "message_key": "api.error.forbidden",
  "message": "ليس لديك صلاحية تنفيذ هذا الإجراء.",
  "meta": {
    "locale": "ar",
    "language_tag": "ar-SA"
  }
}
```

A backend controller must use `localizedSuccessResponse()` or `localizedErrorResponse()` whenever it sends application-owned text. Existing raw controller messages remain measurable through `backend/scripts/api-message-inventory.php`; they are migration debt, not an alternative standard.

## Key lifecycle and review rules

A semantic key is added deliberately with its Arabic and English values in the catalog. It must not be derived from a hash, copied from raw Arabic, or named after implementation syntax. Keys are immutable after release; wording changes affect locale values, not the key, unless the business intent changes. When two messages have identical wording but different ownership or intent, they receive distinct keys. Conversely, a truly shared message may use a shared `common` namespace.

The catalog migration utility produces an ephemeral traceability map from retired opaque IDs to semantic keys for review during a controlled migration. Runtime code and committed catalogs contain only semantic labels. The existing inventory, parity, and coverage gates remain mandatory.

## Persisted localized data standard

A translatable domain value must be explicitly modeled. For short fields such as entity names, the preferred pattern is `name_ar` and `name_en` when relational indexing and predictable queries are important. For richer or evolving content, use a validated JSON translation object such as `{"ar": "…", "en": "…"}`. In both cases, resources resolve a neutral public field (`name`, `description`, or `content`) from the negotiated locale, fall back to the configured fallback locale, and never use UI copy as a data fallback.

Resources must not return localized labels such as `"customer_label"`; clients already own labels. They return locale-resolved values, stable machine codes, and, where justified, an opt-in `translations` object for editors. This keeps API payloads smaller for ordinary screens and preserves all language variants for administrative workflows.

## Consequences

The project gains readable source references, typed catalog parity, deterministic migration evidence, negotiated server language, and a clear boundary between UI text and business data. The initial endpoint inventory identifies remaining raw controller messages by file so those can be migrated incrementally without weakening the contract.

## References

[1] [RFC 9110, HTTP Semantics — Accept-Language](https://datatracker.ietf.org/doc/html/rfc9110#section-12.5.4)  
[2] [MDN, Accept-Language request header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept-Language)  
[3] [MDN, Content-Language response header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Language)  
[4] [Laravel 11.x Localization documentation](https://laravel.com/docs/11.x/localization)

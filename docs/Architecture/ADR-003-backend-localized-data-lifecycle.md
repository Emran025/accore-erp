# ADR-003: Mature Backend Localized-Data Lifecycle

**Status:** Accepted
**Date:** 2026-08-15
**Decision owner:** Backend architecture

## Context

Backend localization was previously handled inconsistently. Some seeders stored Arabic text in a generic `name` column, some system tables stored Arabic and English names together, and API resources flattened business data without indicating which language was represented. Product and category seeders also used count-based early returns or display names as lookup keys, making reruns unsafe and making later translation work difficult.

The correction must distinguish **system-owned reference vocabulary** from **business-owned data**. A permission name, tax type, role description, or organization meta type is application-owned vocabulary. A product name, category name, customer name, or supplier description is domain data whose language variants belong to the record and must survive API and persistence operations.

## Decision

The backend uses an additive bilingual persistence model for high-value inventory and reference entities. Short and indexed values use explicit columns such as `name_ar` and `name_en`; descriptive values use paired `description_ar` and `description_en` columns. The legacy field remains during the migration window for compatibility and is resolved from the requested locale through `App\Support\Localization\LocalizedValue`.

| Layer | Required responsibility | Implemented standard |
|---|---|---|
| Migration | Add language fields without destructive replacement; preserve old values | Additive migrations backfill legacy values and retain legacy columns. |
| Model | Accept and expose language variants | Fillable contracts include explicit language fields and stable `catalog_code` where seed ownership exists. |
| Write action | Normalize every accepted payload once | `LocalizedValue::normaliseInput()` accepts legacy fields, explicit fields, or a translation object and does not erase omitted languages during partial updates. |
| Seeder | Be repeatable and domain-owned | Stable catalog codes with `updateOrCreate()`; no count-based early returns; initial inventory costing is created only for newly seeded products. |
| Resource | Return one resolved value and explicit variants | Resources return locale-resolved fields plus explicit `*_ar`, `*_en`, and `*_translations` values where editorial workflows need them. |
| API negotiation | Select representation language once | `NegotiateApiLocale` resolves `X-Accore-Locale`, then `Accept-Language`, and emits `Content-Language`, `Vary`, and locale metadata. |
| Gate | Prevent regression | `localization-structure-audit.php` checks required seed and migration structures; API message inventory measures remaining legacy controller text. |

> **A seeder is part of the data contract, not a disposable development shortcut.** Seeded records need stable identifiers, reviewed translations, deterministic reruns, and safe side effects.

## Seed-data rules

System-owned seed data must contain stable machine keys, Arabic values, English values, and—where applicable—bilingual descriptions. The machine key is never a display name and never changes when wording is revised. Seeders use `updateOrCreate()` against that key and update only fields owned by the seeder.

Business-owned seed data uses the same bilingual fields when the application owns the sample record. When a record may be user-authored, the seeder must not overwrite user content merely because a seeder is rerun. The category and product seeders therefore match stable catalog codes first and use a one-time Arabic-name fallback only to adopt legacy sample records without duplication.

Initial stock seeding is a domain side effect. It creates a costing layer only when the product itself was newly created; rerunning the seeder updates the master record without creating duplicate inventory-cost layers.

## API and resource rules

A resource returns a locale-resolved neutral field such as `name`, `description`, or `category_name`, while stable codes and explicit translations remain available to clients that edit or audit the record. UI labels are never stored in a business record and are never fabricated from a resource field. The frontend may use `name` for ordinary screens and `name_ar` / `name_en` for language editors.

For user-authored content, the original value and authoring language remain authoritative. Translation is an explicit business workflow, not an automatic dictionary lookup. This prevents customer, supplier, product, and document content from being incorrectly treated as application UI copy.

## Migration and compatibility policy

The migrations are additive and backfill legacy fields into the Arabic and English columns as a preservation fallback. Such a backfill is not claimed to be a translation; it preserves data until a domain owner supplies an approved second-language value. New seed data supplies both reviewed languages directly. Existing clients may continue sending `name` or `description`, while new clients may send `name_ar`, `name_en`, or a structured translation object.

Partial updates are language-safe: omitting `name_en` does not null an existing English value, and omitting all name fields does not write name columns. This property is enforced by unit tests for the shared normalizer.

## Scope of the current correction

The standard is implemented for the inventory catalog, roles, tax authorities, tax types, tax rates, API resources, seeders, migrations, product and category write actions, and request validation. The backend audit also inventories legacy hard-coded controller messages so message-key migration can proceed by domain without masking the remaining work.

## Validation

Fresh migration and full seed execution passes on the isolated test database. Rerunning the role, category, product, and tax seeders preserves the expected counts of 6 roles, 6 categories, 10 products, and 2 tax types. The full Laravel suite passes with the new localization tests included.

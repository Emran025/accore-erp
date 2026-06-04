---
title: "Value Objects — Currencies and Measurements"
domain: "Shared"
subdomain: "ValueObjects"
tier: 1
status: draft
task_id: "SHR-002"
template: "domain-standard"
version: "1.0.0"
created: "2026-03-26"
last_updated: "2026-03-26"
word_count: 488
---

# Value Objects — Currencies and Measurements

## Business Context & Objective

In an ERP system operating across multiple currencies and units of measurement, the consistent treatment of monetary amounts and physical quantities is critical to financial accuracy. The Shared domain's value object conventions define how currencies and measurement quantities are represented, stored, and manipulated throughout the system. Finance teams, international operations, and reporting functions all depend on consistent monetary representation. Any domain that stores a monetary amount or a quantified measurement follows the contracts established here.

<!-- [ASSUMPTION] -->
> **Note:** The `backend/app/Domains/Shared/` directory contains only `Actions/Action.php`, `DTOs/DataTransferObject.php`, and `Services/QRCodeService.php`. There are no dedicated ValueObjects classes in the codebase. Currency and measurement conventions are documented here from the patterns observed in model cast definitions and the Finance domain's CurrencyPolicy implementation. This document describes the system-wide conventions rather than a specific ValueObjects class. Business confirmation that no separate value object library is planned is required.

## Currency Representation

All monetary amounts in accore are stored as `decimal(15,2)` database columns with two decimal places of precision. In Eloquent models, monetary fields are cast to `'decimal:2'` to ensure consistent serialization and to prevent floating-point precision errors in calculations.

The Finance domain's CurrencyPolicy model governs multi-currency support. When a monetary amount is expressed in a non-base currency, the CurrencyPolicy provides the exchange_rate that must be applied before the amount is stored in the base currency of the General Ledger. Cross-currency posting without applying the CurrencyPolicy exchange rate is prohibited.

Monetary fields follow the naming convention: `_amount`, `_value`, `_balance`, or `_cost` suffixes (for example, `purchase_value`, `depreciation_amount`, `book_value`).

## Measurement Representation

Physical quantities are stored as integer or decimal columns depending on the precision required by the business context. The following conventions apply:

| Measurement Type | Storage Type | Example Fields |
|-----------------|-------------|----------------|
| Unit counts (whole items) | `integer` | `stock_quantity`, `useful_life_years`, `installment_count` |
| Percentages and rates | `decimal:2` | `depreciation_rate`, `tax_rate` |
| Quantities with fractional precision | `decimal:4` | Product quantities in procurement |

## ZATCA TLV Encoding (QR Code Amounts)

The QRCodeService in Shared encodes monetary amounts using the ZATCA TLV (Tag-Length-Value) standard for Saudi e-invoicing compliance. In TLV encoding, amounts must be represented as decimal strings with the full precision required by ZATCA specifications. The QRCodeService delegates the actual QR image generation to the frontend or to a future library integration (the current backend implementation returns the TLV data as a base64 string).

## Known Constraints

- The QRCodeService `generateImage()` method throws a `not yet implemented` exception; QR image generation is deferred to a future library or external service integration.
- All monetary arithmetic should use PHP's `bcmath` functions when precision is critical; native float arithmetic is avoided for monetary calculations.

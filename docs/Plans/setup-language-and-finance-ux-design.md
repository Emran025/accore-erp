# Setup Language and Financial Reference UX Design

## Purpose

This design record governs the current setup-experience refinement. It intentionally does **not** redesign the chart of accounts, its hierarchy, or its posting rules. The work improves the language experience, makes the company-code financial attributes intelligible, and removes an ambiguous free-text fiscal-year field.

## Language Boundaries

The application interface language is a local desktop/browser preference. It controls the active dictionary, document language, layout direction, and the UI font. It is persisted through the existing `LocaleProvider` under `accore.locale` and must be changed from the primary System Settings screen.

The organization-context language is different. A client or company-code language describes master data or business context; it must not silently change the current user's application interface. The two concepts are presented as separate settings and use separate labels.

All free-text setup inputs use Unicode-aware first-strong-character direction detection. Arabic, Persian, Hebrew, Syriac, and other right-to-left scripts render right-to-left; Latin and other left-to-right text render left-to-right. Numeric, date, currency, code, and controlled-reference inputs retain their explicit structured behavior.

## Company Code and Chart of Accounts

A company code represents a legally or financially independent accounting unit. The `chart_of_accounts_id` company-code attribute is an assignment to the accounting structure that supplies the general-ledger accounts available to that company code. It is **not** an instruction to choose an individual posting account such as Assets, Cash, or Revenue.

The current ACCORE data model uses `ChartOfAccount` rows as individual accounts, while the organization metadata calls the foreign key `chart_of_accounts_id`. Until a dedicated chart-of-accounts header entity exists, the setup flow must not imply that an individual account is a complete chart. The UI therefore explains the current reference precisely, labels it as an active general-ledger account reference, and gives a structured warning that a production multi-company implementation requires a chart header or ledger-set entity before a company-code chart assignment can be semantically complete.

## Fiscal Year Structure

A fiscal year is a reporting and inventory/balance-sheet period, normally twelve months, divided into posting periods. A fiscal-year variant describes the period pattern and any special closing periods. A company code is assigned one fiscal-year variant, while the periods themselves determine how posting dates are classified. The fiscal-year variant does not itself open or close posting periods.

ACCORE currently stores operational `FiscalPeriod` records but has no dedicated fiscal-year-variant master entity. The setup field therefore must be renamed from the opaque “Fiscal year variant” label to a clear “Fiscal year structure” field and constrained to explicit supported choices. The initial choices are calendar year (`K4`) and a controlled custom-year configuration. The calendar-year choice is the safe default. A custom year is only a descriptor until the system has a managed variant and period-definition model; the UI makes that status explicit rather than suggesting unsupported automation.

## References

1. [SAP Help Portal — Fiscal Year and Fiscal Year Variant](https://help.sap.com/docs/SAP_S4HANA_CLOUD/0fa84c9d9c634132b7c4abb9ffdd8f06/7353d7531a4d424de10000000a174cb4.html)
2. [SAP Learning — Managing Fiscal Year Variants](https://learning.sap.com/courses/customizing-core-settings-in-financial-accounting-in-sap-s4hana/managing-fiscal-year-variants-1)

# ACCORE ERP — Setup & Accounting Acceptance Matrix

## Objective

Validate that a newly configured organization can move from controlled setup to operational readiness without static financial references, broken structural dependencies, or unbalanced accounting prerequisites.

## Execution Boundary

All scenarios run against a local, isolated Laravel/MySQL environment. The environment is seeded from the repository and does not connect to a customer tenant, production database, bank, tax authority, or external accounting service.

## Reference Data Baseline

| Reference area | Controlled source | Expected use in the workflow |
|---|---|---|
| Currency register | Active seeded currencies, including SAR | A company code must select an active functional currency through the searchable register. |
| Chart of accounts | Active seeded ledger accounts, including account `1000` | A company code must select an existing ledger reference through the searchable account lookup. |
| Factory-calendar register | Active, country-bound operating calendars | A plant must select an approved active calendar for its country; arbitrary calendar codes are rejected. |
| Fiscal calendar | A newly opened local fiscal period | Posting and readiness must require an open, unlocked period. |
| Organizational structure | Tenant, company code, controlling area, cost center, profit center, plant, storage location, sales organization, and purchasing organization | Each child entity must be attached to a valid parent according to the configured hierarchy. |
| Operating context | A linked company, cost center, profit center, warehouse, and POS terminal | The operating context must become available only after its mandatory organizational dependencies exist. |

## Acceptance Scenarios

| ID | Scenario | Expected result | Status |
|---|---|---|---|
| ACC-SET-01 | Sign in as the seeded administrator and open Setup. | Setup is protected, loads its readiness status, and exposes the organization workspace. | Passed |
| ACC-SET-02 | Select the Company Code meta-type and search the functional-currency field for `SAR`. | The active Saudi Riyal record is returned from the currency register; no static default list is used. | Passed |
| ACC-SET-03 | Search the chart-of-accounts field for `1000`. | The existing asset account is returned with code, name, and account type. | Passed |
| ACC-SET-04 | Create the organizational foundation in dependency order. | The application prevents invalid parent links and reports readiness as each prerequisite becomes valid. | Passed |
| ACC-SET-05 | Open a fiscal period and validate accounting readiness. | The period is open and unlocked; the readiness API marks the accounting baseline complete only when required accounts and period exist. | Passed |
| ACC-SET-06 | Configure a working operating context. | Warehouse and POS context are accepted only with active organization, cost center, and profit center references. | Passed |
| ACC-SET-07 | Activate the mandatory starter bundle after foundation and operations are ready. | Mandatory modules activate; optional modules with unmet dependencies remain pending with an explicit reason. | Passed — initially held pending until Plant, Storage Location, Sales Organization, and Purchasing Organization were added; activation then succeeded. |
| ACC-SET-08 | Re-open the setup screen after each mutation. | Readiness indicators, fields, labels, and empty states remain consistent with the persisted local data. | Passed — API state refreshed after each mutation; focused UI contract test passed. |
| ACC-SET-09 | Create a Plant with a factory calendar. | The lookup returns active database records only; an existing same-country calendar is accepted and an unknown calendar is rejected. | Passed |

## Accounting Integrity Gates

| Gate | Required condition |
|---|---|
| Reference integrity | Currency and account selections must resolve to active database records, never arbitrary entered identifiers. |
| Period control | A period used for readiness must be open and unlocked. |
| Structure integrity | A unit may only link to an eligible, active parent unit. |
| Context integrity | Operating context requires the linked organizational and controlling references. |
| Activation control | Business modules cannot bypass the mandatory baseline. |
| Factory-calendar control | Plant and shipping-point calendar references must resolve to an active master record and, for plants, match the operating country. |

## Defect Classification

| Priority | Definition |
|---|---|
| Critical | Data integrity, authorization, or accounting-control failure that permits an invalid operational state. |
| High | A mandatory setup flow is blocked or a required database reference cannot be selected. |
| Medium | The flow succeeds but wording, feedback, or presentation causes a material usability risk. |
| Low | Visual or copy inconsistency that does not alter the operational outcome. |

## Findings and Remediation

| ID | Priority | Finding | Resolution and verification |
|---|---|---|---|
| ACC-FIND-01 | High — resolved | `factory_calendar_id` was mandatory but accepted arbitrary free text, creating a risk of a plant operating with an unapproved or mistyped calendar. | Added a `factory_calendars` master-data register, seeded an approved Saudi Arabia/Riyadh calendar, exposed active records through the organizational API, converted the setup field to a searchable selector, and added server-side active and country-match validation. API acceptance test confirmed a valid reference returns `201`; an unknown reference returns `422`. |
| ACC-FIND-02 | Informational | The starter bundle correctly remained blocked while the core operating structure was incomplete. | Verified the system reported the missing Plant, Storage Location, Sales Organization, and Purchasing Organization explicitly. After creating their valid hierarchy, the required starter bundle activated successfully. |
| ACC-FIND-03 | Technical debt | Full frontend type checking is currently blocked by pre-existing generated Next type drift and an unrelated desktop credential-vault test fixture mismatch. | The focused setup UI acceptance test passed. The unrelated errors remain outside this change and should be resolved before a full repository-wide quality gate is made mandatory. |
| ACC-FIND-04 | High — resolved | Currency and chart-of-accounts references were loaded correctly by the UI but had no equivalent server-side validation, allowing direct API callers to submit arbitrary identifiers. | Added active-record validation in the organizational domain service. Focused tests and a live API call confirmed invalid currency and chart references are rejected with `422`; valid active references remain accepted. |

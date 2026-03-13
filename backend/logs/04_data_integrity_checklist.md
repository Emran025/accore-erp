# Data Integrity & Business Rules Checklist

This checklist tracks critical business rules present in our current "Fat Controllers" that must be explicitly verified or ported into the Domain entities or Actions during the transition. No business rule should be "lost in translation".

## Core Auditing
* [ ] Verify that the `AuditTrailController` preserves the correct timestamp, old values, and new values arrays across all mutations.
* [ ] Ensure `NumberRangeService` and `NumberRangeController` generate unique values reliably under heavy concurrency logic without duplications.

## Accounting Integrity
* [ ] Ensure `RecordJournalVoucher` correctly applies double-entry logic (Debits always equal Credits) before writing to the ledger table.
* [ ] Ensure Fiscal Period constraints (e.g. `FiscalPeriodsController`) throw hard exceptions if journal entries attempt to post in locked or closed periods.
* [ ] Maintain consistency in dynamic `CostProfitCenter` derivations.
* [ ] Accruals (`AccrualAccountingController.php`) strictly follow temporal constraints and reversibility logic.

## Payroll & Benefits Integrity
* [ ] Check that `EOSBCalculatorService.php` and its sub-rules preserve identical values for complex labor laws.
* [ ] Verify `PayrollController.php` triggers all edge deductions automatically according to `PayrollComponents` when salary runs are initiated.
* [ ] Validate that absence hours (Leave/Attendance) are locked during processing.

## Commercial Operations & Inventory Validation
* [ ] Ensure `InventoryCostingService.php` accurately tracks FIFO or Weighted Average when items are removed from warehouse through `SalesController` actions.
* [ ] Confirm `PeriodicInventoryController` reconciles physical and theoretical counts reliably without silent overwrites.

## API Compatibility Constraints
* [ ] Guarantee DTOs accept exact legacy JSON payloads implicitly mapping old structure to the unified internal models.
* [ ] Output properties should remain intact, mapping deeply nested legacy API responses backward-compatibly using Resources or Transformers.

---
**Note:** This file will be marked complete iteratively as each Domain Sprint reaches testing. Each unchecked item corresponds to a "danger point" identified in `02_dependency_analysis.md`.

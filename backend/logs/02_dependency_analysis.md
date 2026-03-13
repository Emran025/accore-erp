# Dependency Analysis & Hard Couplings

This document tracks "Hard Couplings" between controllers, services, and domain boundaries that must be resolved before migration. Following the Strangler Fig approach, we identify cross-domain dependencies and establish clean integration routes (e.g., event-driven communication or Domain Interfaces).

## 1. Authentication & Security Dependencies
* **Source:** `AuthController`, `AuthService`
* **Coupling Impact:** Used globally by all endpoints. Request validation heavily couples core domains.
* **Resolution Strategy:** Extract into an Interface `IdentityContract` handled by `EnterpriseCore\IAM\Actions`.

## 2. Cross-Domain Integrations
### 2.1 General Ledger Integration
* **Dependent Domains:** `Human Capital (HCM)` (Payroll), `Supply Chain & Logistics` (Inventory Costing), `Asset Management` (Depreciation).
* **Coupling Detail:** `PayrollService`, `InventoryCostingService`, and `DepreciationService` likely make direct API or Class calls to `LedgerService` or `ChartOfAccountsMappingService`.
* **Resolution Strategy:** Implement an `AccountingIntegrationLayer` residing in `FinancialManagement\Interfaces` to decouple hard service calls.

### 2.2 ZATCA & Tax Subsystems
* **Dependent Domains:** `Commercial Operations` (Sales), `Supply Chain & Logistics` (Purchases).
* **Coupling Detail:** Direct injection of `ZATCAService` into `SalesController` or `PurchasesController`.
* **Resolution Strategy:** Decouple via `TaxEngine` Capability interface. Sales Actions emit `SalesInvoiceCreated` events handled by the Tax listener.
 
## 3. Method Complexities (To be Updated Iteratively)
| Controller/Service | Cross-Domain Calls Identified | Refactoring Complexity Class | Pattern Required |
| --- | --- | --- | --- |
| `PayrollService.php` | DB calls, General Ledger `LedgerService.php` | High | Facade, Observer Pattern |
| `InventoryCostingService.php` | DB, Products Master, G/L | High | Contract Interface |
| `SalesService.php` | TaxEngine, ZATCA, Products | Very High | Message Bus |

---
**Status:** Template Outline - Pending file-by-file AST/Static Code Analysis for Deep Dependency Verification.

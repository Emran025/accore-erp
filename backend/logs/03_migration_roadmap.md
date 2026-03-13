# Code Refactoring & Migration Roadmap

This roadmap details the Strangler Fig approach that will safely decouple massive controllers and services into independent Action classes under the 4-tier domain hierarchy, keeping the application constantly functional without any "Big Bang" rewrites.

## Sprint 1: Foundation Setup & Domain Mapping ✅ COMPLETED
* **Objective:** Establish the directory scaffold and routing facade.
* **Tasks:**
  * [x] Generate the new `app/Domains` directory following the 10 domains pattern.
  * [x] Created `Shared/Actions/Action.php` — Base Action class.
  * [x] Created `Shared/DTOs/DataTransferObject.php` — Base DTO class.
  * [x] Created `routes/domains/` directory with auto-loader (`routes/domain-loader.php`).
  * [x] Wired domain-loader into `routes/api.php`.
  * [x] Verified: `php artisan route:list` shows both legacy and v2 routes successfully.

## Sprint 2: The Enterprise Core Extrication ✅ COMPLETED
* **Objective:** Move Auth and Base Configuration into domain Actions.
* **Tasks:**
  * [x] Extracted `AuthController` logic → `EnterpriseCore\IAM\Actions` (Login, Logout, Check).
  * [x] Extracted `UsersController` logic → `EnterpriseCore\IAM\Actions` (Users CRUD, Passwords, Managers).
  * [x] Extracted `RolesController` logic → `EnterpriseCore\IAM\Actions` (Roles CRUD, Permissions).
  * [x] Extracted `SessionsController` logic → `EnterpriseCore\IAM\Actions` (Session Management).
  * [x] Extracted `SettingsController` logic → `EnterpriseCore\Governance\Actions` (Settings CRUD).
  * [x] Extracted `Audit[Log/Trail]Controller` → `EnterpriseCore\Governance\Actions` (Audit Trail).

## Sprint 3: Finance Domain & Cross-Domain Pillars 🔄 IN PROGRESS
* **Objective:** Extract safe Read/Write operations across top-level domains.
* **Tasks:**
  * [x] Extracted `GeneralLedgerController@trialBalance` → `Finance\GeneralLedger\Actions\GetTrialBalanceAction`.
  * [x] Extracted `JournalVouchersController` (Full CRUD) → `Finance\JournalVouchers\Actions\`. (Includes critical Double-Entry validation).
  * [x] Extracted `ChartOfAccountsController` (Full CRUD + Balances) → `Finance\ChartOfAccounts\Actions\`.
  * [x] Extracted `SalesController` (Invoices) → `Commercial\Sales\Actions\`. (Includes complex Business Rules exception handling).
  * [x] Extracted `CategoriesController` (Inventory) → `SupplyChain\Inventory\Actions\`.
  * [x] Extracted `DepartmentsController` (HR) → `HumanCapital\WorkforceAdmin\Actions\`.

## Sprint 4: Re-Assembling the HCM & Commercial Operations
* **Objective:** Break apart "Fat Controllers" handling large operations.
* **Tasks:**
  * [x] Extracted `PayrollController.php` methods into `HumanCapital\Payroll\Actions\` (10 critical Micro-Actions).
  * [x] Extracted `EmployeesController.php` methods into `HumanCapital\WorkforceAdmin\Actions\` (12 Micro-Actions incl. Documents handling).
  * [x] Extracted `AttendanceController` & `LeaveController` into `HumanCapital\TimeAndAttendance\Actions\` (11 Micro-Actions).
  * [x] Extracted `HrAdministrationController` into `WorkforceAdmin` and `EnterpriseCore\IAM` (15 Micro-Actions).



## Sprint 5: Edge Capabilities (ZATCA, Reporting, Templates)
* **Objective:** Push remaining integrations out of the core pipeline.
* **Tasks:**
  * [ ] Transform `TaxEngineController` logic into Capability layer Actions.
  * [ ] Move BI processing (`ReportsController`, `DashboardController`) to `DataIntelligence` domain.
  * [ ] Move `ComplianceProfileController` to `DigitalPlatform\Compliance` Actions.

---
**Note:** The system now contains **52 dedicated Single Action Classes** executing live atop the original database, safely cloaked under the `/api/v2/` routing prefix. Legacy routes remain entirely untouched.

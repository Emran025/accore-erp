# Source Inventory & Refactoring Map

Based on the 10-domain architecture defined in `03_Enterprise_Domain_Map.md`, here is the comprehensive audit and mapping of current backend Controllers and Services to the new 4-tier hierarchy (Domain -> Capability -> Feature Group -> Screens/Actions).

## Domain 1: Enterprise Core (01-enterprise-core)
### Capabilities & Feature Groups
* **IAM (Identity & Access Management)**
  * *Features:* Authentication, Roles, Users, Sessions
  * *Current Sources:* `AuthController.php`, `RolesController.php`, `UsersController.php`, `SessionsController.php`, `AuthService.php`, `PermissionService.php`
  * *Proposed Action:* Move to `app/Domains/EnterpriseCore/IAM/Actions/{Feature}`
* **System & Governance**
  * *Features:* Settings, Audit Logs, Number Ranges, Master Categories
  * *Current Sources:* `SettingsController.php`, `AuditLogController.php`, `AuditTrailController.php`, `NumberRangeController.php`, `CategoriesController.php`, `NumberRangeService.php`
  * *Proposed Action:* Extract complex generation rules from `NumberRangeController` into Actions.
* **Document Management**
  * *Features:* System Templates, Document Templates
  * *Current Sources:* `DocumentTemplateController.php`, `SystemTemplateController.php`, `TemplateRegistry.php`, `TemplateRenderer.php`, `TemplateService.php`, `TemplateHelper.php`

## Domain 2: Commercial Operations (02-commercial)
### Capabilities & Feature Groups
* **Sales & Revenue**
  * *Features:* Sales Management, Revenues, Sales Returns, Sales Representatives
  * *Current Sources:* `SalesController.php`, `RevenuesController.php`, `SalesReturnController.php`, `SalesRepresentativeController.php`, `SalesService.php`

## Domain 3: Financial Management (03-finance)
### Capabilities & Feature Groups
* **General Ledger & Accounting**
  * *Features:* End-to-End Ledger, Chart of Accounts, Journal Vouchers, Fiscal Periods, Cost Centers
  * *Current Sources:* `GeneralLedgerController.php`, `ChartOfAccountsController.php`, `JournalVouchersController.php`, `FiscalPeriodsController.php`, `CostProfitCenterController.php`, `AccrualAccountingController.php`, `LedgerService.php`, `ChartOfAccountsMappingService.php`
  * *Proposed Action:* Extract posting logic to `RecordJournalVoucherAction`, `CloseFiscalPeriodAction`.
* **Treasury & Cash Management**
  * *Features:* Bank Reconciliations, Multi-Currency, Expenses
  * *Current Sources:* `BankReconciliationController.php`, `CurrencyController.php`, `CurrencyPolicyController.php`, `ExpensesController.php`, `MultiCurrencyLedgerService.php`, `CurrencyPolicyService.php`
* **Accounts Payable (AP) & Accounts Receivable (AR)**
  * *Features:* Invoices, Transactions
  * *Current Sources:* `ApController.php`, `ApTransactionsController.php`, `ArController.php`, `ArTransactionsController.php`
* **Tax & Compliance**
  * *Features:* Tax Engine, ZATCA Integration
  * *Current Sources:* `TaxEngineController.php`, `ZATCAInvoiceController.php`, `ZATCAService.php`, `UBLGeneratorService.php`

## Domain 4: Supply Chain & Logistics (04-supply-chain)
### Capabilities & Feature Groups
* **Procurement**
  * *Features:* Purchasing
  * *Current Sources:* `PurchasesController.php`, `PurchaseService.php`
* **Inventory Management**
  * *Features:* Periodic Inventory, Products Master
  * *Current Sources:* `PeriodicInventoryController.php`, `ProductsController.php`, `InventoryCostingService.php`

## Domain 6: Human Capital (HCM) (06-hcm)
### Capabilities & Feature Groups
* **Workforce Admin**
  * *Features:* Employees, HR Admin, Org Structure, Contracts, Loans, Departments, Succession, Relations
  * *Current Sources:* `EmployeesController.php`, `HrAdministrationController.php`, `DepartmentsController.php`, `EmployeeContractsController.php`, `EmployeeLoansController.php`, `EmployeeRelationsController.php`, `SuccessionController.php`, `ContingentWorkersController.php`, `ExpatManagementController.php`, `OrgStructureController.php`, `OrgIntegrationController.php`, `OrgStructureService.php`, `OrgIntegrationService.php`, `EmployeeContextBuilder.php`, `EmployeeAccountService.php`
* **Time & Attendance**
  * *Features:* Attendance Tracking, Biometrics, Leave, Work Scheduling
  * *Current Sources:* `AttendanceController.php`, `BiometricController.php`, `LeaveController.php`, `WorkforceSchedulingController.php`, `AttendanceService.php`, `LeaveService.php`
* **Payroll & Benefits**
  * *Features:* Salary Calculation, Payroll Runs, Benefits, Compensation, End of Service, Post-Payroll
  * *Current Sources:* `PayrollController.php`, `PayrollComponentsController.php`, `PostPayrollController.php`, `BenefitsController.php`, `CompensationController.php`, `EOSBController.php`, `PayrollService.php`, `SalaryCalculatorService.php`, `SalaryCalculatorInterface.php`, `EOSBCalculatorService.php`
* **Talent Management**
  * *Features:* Onboarding, Recruitment, Performance, Learning, Wellness
  * *Current Sources:* `OnboardingController.php`, `RecruitmentController.php`, `PerformanceController.php`, `LearningController.php`, `WellnessController.php`

## Domain 8: Asset Management (08-asset-management)
* **Assets & Maintenance**
  * *Features:* Fixed Assets, Depreciation, Employee Assets
  * *Current Sources:* `AssetsController.php`, `EmployeeAssetsController.php`, `DepreciationService.php`

## Domain 9 & 10 (Data / Digital) Unmapped / Utility Sources
* `DashboardController.php`, `ReportsController.php` -> Move to Data & Intelligence Actions.
* `BatchController.php` -> Move to Digial Platform / Automation Actions.
* `CorporateCommunicationsController.php`, `KnowledgeManagementController.php`, `QaComplianceController.php`, `EhsController.php`, `ComplianceProfileController.php` -> Miscellaneous HCM or separate Compliance Domain logic mappings.

---
**Note:** This inventory will be iteratively updated as controllers are decoupled into Single Action Classes (SACs). Complexity grades have to be generated later as we inspect individual methods inside big controllers like `PayrollController` or `PurchasesController`.

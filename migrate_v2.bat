@echo off
setlocal enabledelayedexpansion

:: =============================================================================
:: V2 Migration & Restructuring Script (Windows Batch Version - COMPREHENSIVE)
:: This script captures ALL staged and unstaged changes across 25 meatier commits.
:: =============================================================================

echo Starting Comprehensive V2 Migration commits...

:: Commit 1: Core Architecture & Shared Shared Infrastructure
git add ^
    backend/app/Contracts ^
    backend/app/Domains/Shared ^
    backend/app/Http/Controllers/Api/V2/Shared ^
    backend/app/Helpers ^
    backend/app/Providers ^
    backend/app/Http/Middleware/ApiAuth.php ^
    backend/app/Http/Middleware/CheckPermission.php ^
    backend/config/auth.php ^
    backend/tests/TestCase.php ^
    backend/tests/Unit/Helpers
call :commit_step "feat(core): implement V2 base architecture and shared infrastructure"

:: Commit 2: Enterprise Core - IAM (Identity & Access)
git add ^
    backend/app/Domains/EnterpriseCore/IAM ^
    backend/app/Http/Controllers/Api/V2/EnterpriseCore/IAM ^
    backend/app/Http/Requests/EnterpriseCore/IAM ^
    backend/database/factories/UserFactory.php ^
    backend/database/factories/RoleFactory.php ^
    backend/database/factories/RolePermissionFactory.php ^
    backend/database/factories/LoginAttemptFactory.php ^
    backend/database/seeders/UserSeeder.php ^
    backend/database/seeders/RoleSeeder.php ^
    backend/database/seeders/PermissionSeeder.php ^
    backend/tests/Feature/Api/AuthApiTest.php ^
    backend/tests/Feature/Api/UsersApiTest.php ^
    backend/tests/Feature/Api/RolesApiTest.php
call :commit_step "feat(iam): refactor identity and access management to action-based pattern"

:: Commit 3: Enterprise Core - Governance & Settings
git add ^
    backend/app/Domains/EnterpriseCore/Governance ^
    backend/app/Http/Controllers/Api/V2/EnterpriseCore/Governance ^
    backend/app/Http/Requests/EnterpriseCore/Governance ^
    backend/database/factories/SettingsFactory.php ^
    backend/database/factories/DocumentTemplateFactory.php ^
    backend/database/seeders/SettingsSeeder.php ^
    backend/database/seeders/DocumentTemplateSeeder.php ^
    backend/tests/Feature/Api/SettingsApiTest.php ^
    backend/tests/Feature/Api/AuditLogControllerTest.php 2>nul
call :commit_step "feat(governance): migrate system settings and document template engine"

:: Commit 4: Enterprise Core - Org Structure Core
git add ^
    backend/app/Domains/EnterpriseCore/OrgStructure ^
    backend/app/Http/Controllers/Api/V2/EnterpriseCore/OrgStructure ^
    backend/app/Http/Requests/EnterpriseCore/OrgStructure ^
    backend/database/seeders/OrgStructureSeeder.php ^
    backend/tests/Unit/Services/OrgStructureServiceTest.php ^
    backend/tests/Feature/Api/OrgStructureControllerTest.php 2>nul
call :commit_step "feat(org): refactor organizational structure models and actions"

:: Commit 5: Enterprise Core - Org Integration & Number Ranges
git add ^
    backend/app/Domains/EnterpriseCore/OrgIntegration ^
    backend/app/Domains/EnterpriseCore/NumberRanges ^
    backend/app/Http/Controllers/Api/V2/EnterpriseCore/OrgIntegration ^
    backend/app/Http/Controllers/Api/V2/EnterpriseCore/NumberRanges ^
    backend/app/Http/Requests/EnterpriseCore/OrgIntegration ^
    backend/app/Http/Requests/EnterpriseCore/NumberRanges ^
    backend/database/seeders/DocumentSequenceSeeder.php ^
    backend/tests/Unit/Services/NumberRangeServiceTest.php
call :commit_step "feat(org): implement cross-module integration and number range services"

:: Commit 6: Finance - Chart of Accounts & Fiscal Periods
git add ^
    backend/app/Domains/Finance/ChartOfAccounts ^
    backend/app/Domains/Finance/FiscalPeriods ^
    backend/app/Http/Controllers/Api/V2/Finance/ChartOfAccounts ^
    backend/app/Http/Controllers/Api/V2/Finance/FiscalPeriods ^
    backend/app/Http/Requests/Finance/ChartOfAccounts ^
    backend/app/Http/Requests/Finance/FiscalPeriods ^
    backend/database/factories/ChartOfAccountFactory.php ^
    backend/database/factories/FiscalPeriodFactory.php ^
    backend/database/seeders/ChartOfAccountsSeeder.php ^
    backend/tests/Feature/Api/ChartOfAccountsApiTest.php ^
    backend/tests/Feature/Api/FiscalPeriodsApiTest.php
call :commit_step "feat(finance): refactor chart of accounts and fiscal period management"

:: Commit 7: Finance - Treasury & Currency Policies
git add ^
    backend/app/Domains/Finance/Treasury ^
    backend/app/Domains/Finance/Currency ^
    backend/app/Domains/Finance/CurrencyPolicy ^
    backend/app/Http/Controllers/Api/V2/Finance/Currency ^
    backend/app/Http/Requests/Finance/Currency ^
    backend/app/Http/Requests/Finance/CurrencyPolicy ^
    backend/database/factories/CurrencyFactory.php ^
    backend/database/factories/CurrencyPolicyFactory.php ^
    backend/database/seeders/CurrencySeeder.php ^
    backend/database/seeders/CurrencyPolicySeeder.php ^
    backend/tests/Feature/Api/CurrencyApiTest.php
call :commit_step "feat(finance): implement multi-currency treasury and revaluation engine"

:: Commit 8: Finance - Cost & Profit Center Management
git add ^
    backend/app/Domains/Finance/CostProfitCenters ^
    backend/app/Http/Controllers/Api/V2/Finance/CostProfitCenters ^
    backend/app/Http/Requests/Finance/CostProfitCenters ^
    backend/database/factories/CostCenterFactory.php 2>nul ^
    backend/database/factories/ProfitCenterFactory.php 2>nul
call :commit_step "feat(finance): migrate cost and profit center hierarchical management"

:: Commit 9: Finance - General Ledger Core
git add ^
    backend/app/Domains/Finance/GeneralLedger ^
    backend/app/Http/Controllers/Api/V2/Finance/GeneralLedger/GeneralLedgerController.php ^
    backend/app/Http/Requests/Finance/GeneralLedger/TrialBalanceRequest.php ^
    backend/app/Http/Requests/Finance/GeneralLedger/AccountDetailsRequest.php ^
    backend/app/Http/Requests/Finance/GeneralLedger/ListGlEntriesRequest.php ^
    backend/database/factories/GeneralLedgerFactory.php ^
    backend/database/factories/UniversalJournalFactory.php ^
    backend/tests/Feature/Api/GeneralLedgerApiTest.php
call :commit_step "feat(gl): refactor general ledger and universal journal core"

:: Commit 10: Finance - Journal Vouchers & Automation
git add ^
    backend/app/Domains/Finance/JournalVouchers ^
    backend/app/Http/Controllers/Api/V2/Finance/JournalVouchers ^
    backend/app/Http/Controllers/Api/V2/Finance/GeneralLedger/RecurringTransactionsController.php ^
    backend/app/Http/Requests/Finance/JournalVouchers ^
    backend/app/Http/Requests/Finance/GeneralLedger ^
    backend/app/Policies/JournalVoucherPolicy.php ^
    backend/tests/Feature/Api/JournalVouchersApiTest.php ^
    backend/tests/Feature/Api/RecurringTransactionsApiTest.php
call :commit_step "feat(finance): migrate journal vouchers and recurring transaction automation"

:: Commit 11: Finance - Revenues & Expenses
git add ^
    backend/app/Domains/Finance/Revenues ^
    backend/app/Domains/Finance/Expenses ^
    backend/app/Http/Controllers/Api/V2/Finance/Revenues ^
    backend/app/Http/Controllers/Api/V2/Finance/Expenses ^
    backend/app/Http/Requests/Finance/Revenues ^
    backend/app/Http/Requests/Finance/Expenses ^
    backend/database/factories/RevenueFactory.php ^
    backend/database/factories/ExpenseFactory.php
call :commit_step "feat(finance): refactor revenue and expense tracking systems"

:: Commit 12: Finance - Taxation & ZATCA Onboarding
git add ^
    backend/app/Domains/Finance/Taxation ^
    backend/app/Http/Requests/Finance/Taxation ^
    backend/database/factories/TaxAuthorityFactory.php ^
    backend/database/factories/TaxTypeFactory.php ^
    backend/database/factories/TaxRateFactory.php ^
    backend/database/seeders/TaxSeeder.php ^
    backend/tests/Feature/TaxEngineIntegrationTest.php
call :commit_step "feat(tax): implement unified taxation engine and regulatory setup"

:: Commit 13: Finance - Banking & Accruals
git add ^
    backend/app/Domains/Finance/Accrual ^
    backend/app/Domains/Finance/BankReconciliation ^
    backend/app/Http/Controllers/Api/V2/Finance/Accrual ^
    backend/app/Http/Controllers/Api/V2/Finance/BankReconciliation ^
    backend/database/factories/ReconciliationFactory.php ^
    backend/tests/Feature/Api/AccrualAccountingApiTest.php
call :commit_step "feat(finance): refactor bank reconciliation and accrual management"

:: Commit 14: Commercial - Accounts Payable (AP)
git add ^
    backend/app/Domains/Commercial/AccountsPayable ^
    backend/app/Http/Controllers/Api/V2/Commercial/AccountsPayable ^
    backend/app/Http/Requests/Commercial/AccountsPayable ^
    backend/app/Http/Resources/ApTransactionResource.php ^
    backend/database/factories/ApSupplierFactory.php ^
    backend/tests/Feature/Api/ApApiTest.php
call :commit_step "feat(ap): refactor accounts payable and supplier Lifecycle"

:: Commit 15: Commercial - Accounts Receivable (AR)
git add ^
    backend/app/Domains/Commercial/AccountsReceivable ^
    backend/app/Http/Controllers/Api/V2/Commercial/AccountsReceivable ^
    backend/app/Http/Requests/Commercial/AccountsReceivable ^
    backend/app/Http/Resources/ArTransactionResource.php ^
    backend/database/factories/ArCustomerFactory.php ^
    backend/tests/Feature/Api/ArApiTest.php
call :commit_step "feat(ar): refactor accounts receivable and customer lifecycle"

:: Commit 16: Commercial - Sales & Core Invoicing
git add ^
    backend/app/Domains/Commercial/Sales/Models/Invoice.php ^
    backend/app/Domains/Commercial/Sales/Models/InvoiceItem.php ^
    backend/app/Domains/Commercial/Sales/Actions/CreateInvoiceAction.php ^
    backend/app/Domains/Commercial/Sales/Actions/ShowInvoiceAction.php ^
    backend/app/Domains/Commercial/Sales/Actions/ListInvoicesAction.php ^
    backend/app/Http/Controllers/Api/V2/Commercial/Sales/SalesController.php ^
    backend/app/Http/Requests/Commercial/Sales/StoreInvoiceRequest.php ^
    backend/app/Http/Resources/InvoiceResource.php ^
    backend/app/Models/Invoice.php ^
    backend/app/Policies/InvoicePolicy.php ^
    backend/database/factories/InvoiceFactory.php ^
    backend/tests/Feature/Api/InvoicesApiTest.php
call :commit_step "feat(sales): refactor core invoicing system to domain-driven pattern"

:: Commit 17: Commercial - ZATCA E-Invoicing Compliance
git add ^
    backend/app/Domains/Commercial/Sales/Actions/SubmitZatcaInvoiceAction.php ^
    backend/app/Domains/Commercial/Sales/Services/ZATCAService.php 2>nul ^
    backend/app/Domains/Commercial/Sales/Services/UBLGeneratorService.php 2>nul ^
    backend/app/Http/Controllers/Api/V2/Finance/Taxation/ZATCAInvoiceController.php ^
    backend/database/factories/ZatcaEinvoiceFactory.php ^
    backend/tests/Feature/Api/ZatcaApiTest.php
call :commit_step "feat(zatca): implement Saudi Arabian e-invoicing compliance integration"

:: Commit 18: Commercial - Purchasing & Procurement
git add ^
    backend/app/Domains/Commercial/Purchases ^
    backend/app/Http/Controllers/Api/V2/Commercial/Purchases ^
    backend/app/Http/Requests/Commercial/Purchases ^
    backend/app/Models/Purchase.php ^
    backend/database/factories/PurchaseFactory.php ^
    backend/tests/Feature/Api/PurchasesApiTest.php
call :commit_step "feat(procurement): refactor purchasing and procurement workflows"

:: Commit 19: Commercial - Returns & Representatives
git add ^
    backend/app/Domains/Commercial/Sales/Actions/SalesReturnsLedgerAction.php ^
    backend/app/Domains/Commercial/Sales/Actions/ShowSalesReturnAction.php ^
    backend/app/Domains/Commercial/Sales/Models/SalesReturn.php ^
    backend/app/Domains/Commercial/Sales/Models/SalesReturnItem.php ^
    backend/app/Domains/Commercial/SalesRepresentatives ^
    backend/app/Http/Requests/Commercial/Sales/LedgerSalesReturnsRequest.php ^
    backend/tests/Feature/Api/SalesRepresentativeApiTest.php
call :commit_step "feat(commercial): migrate sales returns ledger and representative management"

:: Commit 20: Human Capital - Workforce Core
git add ^
    backend/app/Domains/HumanCapital/WorkforceAdmin/Models/Employee.php ^
    backend/app/Domains/HumanCapital/WorkforceAdmin/Models/Department.php ^
    backend/app/Domains/HumanCapital/WorkforceAdmin/Actions/CreateEmployeeAction.php ^
    backend/app/Domains/HumanCapital/WorkforceAdmin/Actions/ListEmployeesAction.php ^
    backend/app/Http/Controllers/Api/V2/HumanCapital/WorkforceAdmin ^
    backend/app/Http/Requests/HumanCapital/WorkforceAdmin/StoreEmployeeRequest.php ^
    backend/database/factories/EmployeeFactory.php ^
    backend/database/factories/DepartmentFactory.php ^
    backend/tests/Feature/Api/EmployeesApiTest.php
call :commit_step "feat(hr): refactor workforce administration and employee core"

:: Commit 21: Human Capital - Staff Lifecycle & Contracts
git add ^
    backend/app/Domains/HumanCapital/WorkforceAdmin/Models/EmployeeContract.php ^
    backend/app/Domains/HumanCapital/WorkforceAdmin/Models/JobTitle.php ^
    backend/app/Domains/HumanCapital/WorkforceAdmin/Models/Position.php ^
    backend/app/Domains/HumanCapital/WorkforceAdmin/Actions/CreateContractAction.php ^
    backend/app/Http/Requests/HumanCapital/WorkforceAdmin/StoreEmployeeContractRequest.php ^
    backend/tests/Feature/Hr/HrAdministrationTest.php
call :commit_step "feat(hr): migrate employee contracts, job titles, and positions"

:: Commit 22: Human Capital - Compliance, Health & Safety
git add ^
    backend/app/Domains/HumanCapital/WorkforceAdmin/Models/ComplianceProfile.php ^
    backend/app/Domains/HumanCapital/WorkforceAdmin/Models/EhsIncident.php ^
    backend/app/Domains/HumanCapital/WorkforceAdmin/Models/EmployeeHealthRecord.php ^
    backend/app/Domains/HumanCapital/WorkforceAdmin/Models/WellnessProgram.php ^
    backend/app/Http/Requests/HumanCapital/WorkforceAdmin/StoreWellnessParticipationRequest.php ^
    backend/app/Http/Requests/HumanCapital/WorkforceAdmin/StoreWellnessProgramRequest.php
call :commit_step "feat(hr): implement organizational compliance and employee welfare modules"

:: Commit 23: Human Capital - Payroll & Time Management
git add ^
    backend/app/Domains/HumanCapital/Payroll ^
    backend/app/Domains/HumanCapital/TimeAndAttendance ^
    backend/app/Http/Controllers/Api/V2/HumanCapital/Payroll ^
    backend/app/Http/Requests/HumanCapital/Payroll ^
    backend/tests/Feature/Api/PayrollApiTest.php ^
    backend/tests/Feature/Api/AttendanceApiTest.php
call :commit_step "feat(hr): refactor payroll engine and time/attendance tracking"

:: Commit 24: Supply Chain, Manufacturing & Intelligence
git add ^
    backend/app/Domains/SupplyChain ^
    backend/app/Domains/Manufacturing ^
    backend/app/Domains/DataIntelligence ^
    backend/app/Http/Controllers/Api/V2/SupplyChain ^
    backend/app/Http/Requests/SupplyChain ^
    backend/database/seeders/ProductSeeder.php ^
    backend/tests/Feature/Api/InventoryApiTest.php ^
    backend/tests/Feature/Api/ReportsApiTest.php
call :commit_step "feat(scm): refactor supply chain, manufacturing, and analytics domains"

:: Commit 25: Finalization & Legacy Cleanup
:: This step deletes the old app/Services that have been migrated
git rm -r backend/app/Services 2>nul
git add ^
    backend/routes ^
    backend/app/Domains/DigitalPlatform ^
    backend/app/Domains/AssetManagement ^
    backend/app/Http/Controllers/Api/V2 ^
    backend/README.md ^
    migrate_v2.bat
call :commit_step "chore: finalize V2 restructuring and remove deprecated legacy services"

echo V2 Migration completed with 25 comprehensive commits.
goto :eof

:commit_step
echo Committing: %~1
git commit -m "%~1"
exit /b

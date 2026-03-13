@echo off
setlocal enabledelayedexpansion

:: =============================================================================
:: V2 Migration & Restructuring Script (Windows Batch Version)
:: Orchestrates 25 detailed commits to migrate to Action-based pattern and DDD
:: =============================================================================

echo Starting V2 Migration commits...

:: Commit 1: Core Architecture & Shared Infrastructure
git add ^
    backend/app/Contracts/TaxAuthorityInterface.php ^
    backend/app/Domains/Shared ^
    backend/app/Http/Controllers/Api/V2/Shared/BaseApiController.php ^
    backend/app/Helpers/CurrencyHelper.php ^
    backend/app/Providers/AppServiceProvider.php ^
    backend/app/Http/Middleware/ApiAuth.php ^
    backend/app/Http/Middleware/CheckPermission.php ^
    backend/config/auth.php ^
    backend/tests/Unit/Helpers/CurrencyHelperTest.php ^
    backend/tests/TestCase.php
call :commit_step "feat(core): implement V2 base architecture and shared action infrastructure"

:: Commit 2: Enterprise Core - IAM (Identity & Access Management)
git add ^
    backend/app/Domains/EnterpriseCore/IAM ^
    backend/app/Http/Controllers/Api/V2/EnterpriseCore/IAM ^
    backend/app/Http/Requests/EnterpriseCore/IAM ^
    backend/database/factories/UserFactory.php ^
    backend/database/factories/RoleFactory.php ^
    backend/database/factories/RolePermissionFactory.php ^
    backend/database/factories/LoginAttemptFactory.php ^
    backend/database/factories/ModuleFactory.php ^
    backend/database/seeders/UserSeeder.php ^
    backend/database/seeders/RoleSeeder.php ^
    backend/database/seeders/PermissionSeeder.php ^
    backend/database/seeders/ModuleSeeder.php ^
    backend/tests/Feature/Api/AuthApiTest.php ^
    backend/tests/Feature/Api/UsersApiTest.php ^
    backend/tests/Feature/Api/RolesApiTest.php ^
    backend/tests/Unit/Services/AuthServiceTest.php ^
    backend/tests/Unit/Services/PermissionServiceTest.php
call :commit_step "feat(iam): refactor identity and access management to action-based pattern"

:: Commit 3: Enterprise Core - Governance & System Settings
git add ^
    backend/app/Domains/EnterpriseCore/Governance ^
    backend/app/Http/Controllers/Api/V2/EnterpriseCore/Governance ^
    backend/app/Http/Requests/EnterpriseCore/Governance ^
    backend/database/factories/SettingsFactory.php ^
    backend/database/seeders/SettingsSeeder.php ^
    backend/tests/Feature/Api/SettingsApiTest.php ^
    backend/tests/Feature/Api/AuditLogControllerTest.php ^
    backend/tests/Feature/Api/AuditTrailControllerTest.php
:: Handle manual adds for missing tests if they exist in the list
git add backend/tests/Feature/Api/AuditLogController.php 2>nul
call :commit_step "feat(governance): migrate system settings and audit logging to V2"

:: Commit 4: Enterprise Core - Org Structure & Integration
git add ^
    backend/app/Domains/EnterpriseCore/OrgStructure ^
    backend/app/Domains/EnterpriseCore/OrgIntegration ^
    backend/app/Http/Controllers/Api/V2/EnterpriseCore/OrgStructure ^
    backend/app/Http/Controllers/Api/V2/EnterpriseCore/OrgIntegration ^
    backend/app/Http/Requests/EnterpriseCore/OrgStructure ^
    backend/app/Http/Requests/EnterpriseCore/OrgIntegration ^
    backend/database/seeders/OrgStructureSeeder.php ^
    backend/tests/Unit/Services/OrgStructureServiceTest.php ^
    backend/tests/Feature/Api/OrgStructureControllerTest.php 2>nul
call :commit_step "feat(org): refactor organizational structure and integration services"

:: Commit 5: Enterprise Core - Number Ranges
git add ^
    backend/app/Domains/EnterpriseCore/NumberRanges ^
    backend/app/Http/Controllers/Api/V2/EnterpriseCore/NumberRanges ^
    backend/app/Http/Requests/EnterpriseCore/NumberRanges ^
    backend/database/factories/Nr*Factory.php ^
    backend/database/seeders/DocumentSequenceSeeder.php ^
    backend/tests/Feature/Api/NumberRangeApiTest.php ^
    backend/tests/Unit/Services/NumberRangeServiceTest.php
call :commit_step "feat(nr): implement number range and document sequence management V2"

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
    backend/tests/Feature/Api/FiscalPeriodsApiTest.php ^
    backend/tests/Unit/Services/ChartOfAccountsMappingServiceTest.php
call :commit_step "feat(finance): refactor chart of accounts and fiscal period management"

:: Commit 7: Finance - Currency & Exchange Rate Policies
git add ^
    backend/app/Domains/Finance/Currency ^
    backend/app/Domains/Finance/CurrencyPolicy ^
    backend/app/Http/Controllers/Api/V2/Finance/Currency ^
    backend/app/Http/Controllers/Api/V2/Finance/CurrencyPolicy ^
    backend/app/Http/Requests/Finance/Currency ^
    backend/app/Http/Requests/Finance/CurrencyPolicy ^
    backend/database/factories/CurrencyFactory.php ^
    backend/database/factories/CurrencyPolicyFactory.php ^
    backend/database/seeders/CurrencySeeder.php ^
    backend/database/seeders/CurrencyPolicySeeder.php ^
    backend/tests/Feature/Api/CurrencyApiTest.php ^
    backend/tests/Unit/Services/CurrencyPolicyServiceTest.php
call :commit_step "feat(finance): implement multi-currency and exchange rate policy engine"

:: Commit 8: Finance - General Ledger Core
git add ^
    backend/app/Domains/Finance/GeneralLedger ^
    backend/app/Http/Controllers/Api/V2/Finance/GeneralLedger/GeneralLedgerController.php ^
    backend/app/Http/Requests/Finance/GeneralLedger/TrialBalanceRequest.php ^
    backend/app/Http/Requests/Finance/GeneralLedger/AccountDetailsRequest.php ^
    backend/app/Http/Requests/Finance/GeneralLedger/ListGlEntriesRequest.php ^
    backend/database/factories/GeneralLedgerFactory.php ^
    backend/database/factories/UniversalJournalFactory.php ^
    backend/tests/Feature/Api/GeneralLedgerApiTest.php ^
    backend/tests/Unit/Services/LedgerServiceTest.php ^
    backend/tests/Unit/Services/MultiCurrencyLedgerServiceTest.php ^
    backend/tests/Unit/Services/LedgerServiceFiscalPeriodTest.php
call :commit_step "feat(gl): refactor general ledger and universal journal services"

:: Commit 9: Finance - Journal Vouchers & Automation
git add ^
    backend/app/Domains/Finance/JournalVouchers ^
    backend/app/Http/Controllers/Api/V2/Finance/JournalVouchers ^
    backend/app/Http/Controllers/Api/V2/Finance/GeneralLedger/RecurringTransactionsController.php ^
    backend/app/Http/Requests/Finance/JournalVouchers ^
    backend/app/Http/Requests/Finance/GeneralLedger/StoreRecurringTransactionRequest.php ^
    backend/app/Http/Requests/Finance/GeneralLedger/ListRecurringTransactionsRequest.php ^
    backend/tests/Feature/Api/JournalVouchersApiTest.php ^
    backend/tests/Feature/Api/RecurringTransactionsApiTest.php ^
    backend/tests/Feature/Authorization/JournalVoucherPolicyTest.php ^
    backend/app/Policies/JournalVoucherPolicy.php
call :commit_step "feat(finance): migrate journal vouchers and recurring transactions"

:: Commit 10: Finance - Revenues & Expenses Tracking
git add ^
    backend/app/Domains/Finance/Revenues ^
    backend/app/Domains/Finance/Expenses ^
    backend/app/Http/Controllers/Api/V2/Finance/Revenues ^
    backend/app/Http/Controllers/Api/V2/Finance/Expenses ^
    backend/app/Http/Requests/Finance/Revenues ^
    backend/app/Http/Requests/Finance/Expenses ^
    backend/database/factories/RevenueFactory.php ^
    backend/database/factories/ExpenseFactory.php ^
    backend/tests/Feature/Api/RevenuesApiTest.php ^
    backend/tests/Feature/Api/ExpensesApiTest.php
call :commit_step "feat(finance): refactor revenue and expense management"

:: Commit 11: Finance - Taxation Infrastructure
git add ^
    backend/app/Domains/Finance/Taxation ^
    backend/app/Http/Requests/Finance/Taxation ^
    backend/database/factories/TaxAuthorityFactory.php ^
    backend/database/factories/TaxTypeFactory.php ^
    backend/database/factories/TaxRateFactory.php ^
    backend/database/seeders/TaxSeeder.php ^
    backend/database/migrations/2026_02_28_000006_migrate_invoices_to_tax_lines.php ^
    backend/tests/Feature/TaxEngineIntegrationTest.php
call :commit_step "feat(tax): implement unified taxation engine and regulatory setup"

:: Commit 12: Finance - Accrual Accounting & Bank Reconciliation
git add ^
    backend/app/Domains/Finance/Accrual ^
    backend/app/Domains/Finance/BankReconciliation ^
    backend/app/Http/Controllers/Api/V2/Finance/Accrual ^
    backend/app/Http/Controllers/Api/V2/Finance/BankReconciliation ^
    backend/database/factories/ReconciliationFactory.php ^
    backend/tests/Feature/Api/AccrualAccountingApiTest.php ^
    backend/tests/Feature/Api/BankReconciliationApiTest.php
call :commit_step "feat(finance): refactor accrual accounting and bank reconciliation"

:: Commit 13: Finance - Cost & Profit Center Management
git add ^
    backend/app/Domains/Finance/CostProfitCenters ^
    backend/app/Http/Controllers/Api/V2/Finance/CostProfitCenters ^
    backend/app/Http/Requests/Finance/CostProfitCenters ^
    backend/tests/Feature/Api/CostProfitCenterController.php 2>nul
call :commit_step "feat(finance): migrate cost and profit center management"

:: Commit 14: Commercial - Accounts Payable & Supplier Management
git add ^
    backend/app/Domains/Commercial/AccountsPayable ^
    backend/app/Http/Controllers/Api/V2/Commercial/AccountsPayable ^
    backend/app/Http/Requests/Commercial/AccountsPayable ^
    backend/database/factories/ApSupplierFactory.php ^
    backend/database/factories/ApTransactionFactory.php ^
    backend/tests/Feature/Api/ApApiTest.php
call :commit_step "feat(ap): refactor accounts payable and supplier lifecycle"

:: Commit 15: Commercial - Accounts Receivable & Customer Management
git add ^
    backend/app/Domains/Commercial/AccountsReceivable ^
    backend/app/Http/Controllers/Api/V2/Commercial/AccountsReceivable ^
    backend/app/Http/Requests/Commercial/AccountsReceivable ^
    backend/database/factories/ArCustomerFactory.php ^
    backend/database/factories/ArTransactionFactory.php ^
    backend/tests/Feature/Api/ArApiTest.php
call :commit_step "feat(ar): refactor accounts receivable and customer lifecycle"

:: Commit 16: Commercial - Sales & Core Invoicing
git add ^
    backend/app/Domains/Commercial/Sales/Models/Invoice.php ^
    backend/app/Domains/Commercial/Sales/Models/InvoiceItem.php ^
    backend/app/Domains/Commercial/Sales/Actions/CreateInvoiceAction.php ^
    backend/app/Domains/Commercial/Sales/Actions/ShowInvoiceAction.php ^
    backend/app/Domains/Commercial/Sales/Actions/ListInvoicesAction.php ^
    backend/app/Domains/Commercial/Sales/Actions/DeleteInvoiceAction.php ^
    backend/app/Http/Controllers/Api/V2/Commercial/Sales/SalesController.php ^
    backend/app/Http/Requests/Commercial/Sales/StoreInvoiceRequest.php ^
    backend/app/Http/Requests/Commercial/Sales/ListInvoicesRequest.php ^
    backend/app/Http/Resources/InvoiceResource.php ^
    backend/app/Models/Invoice.php ^
    backend/app/Policies/InvoicePolicy.php ^
    backend/database/factories/InvoiceFactory.php ^
    backend/database/factories/InvoiceItemFactory.php ^
    backend/tests/Feature/Api/InvoicesApiTest.php ^
    backend/tests/Feature/Authorization/InvoicePolicyTest.php
call :commit_step "feat(sales): refactor core invoicing system to action-based pattern"

:: Commit 17: Commercial - ZATCA E-Invoicing Implementation
git add ^
    backend/app/Domains/Commercial/Sales/Actions/SubmitZatcaInvoiceAction.php ^
    backend/app/Domains/Commercial/Sales/Actions/GetZatcaStatusAction.php ^
    backend/app/Http/Controllers/Api/V2/Finance/Taxation/ZATCAInvoiceController.php ^
    backend/database/factories/ZatcaEinvoiceFactory.php ^
    backend/tests/Feature/Api/ZatcaApiTest.php ^
    backend/tests/Feature/Api/ZatcaSettingsTest.php ^
    backend/tests/Unit/Services/ZATCAServiceTest.php ^
    backend/tests/Unit/Services/UBLGeneratorServiceTest.php
call :commit_step "feat(zatca): implement Saudi Arabian e-invoicing compliance integration"

:: Commit 18: Commercial - Purchasing & Return Logic
git add ^
    backend/app/Domains/Commercial/Purchases ^
    backend/app/Domains/Commercial/Sales/Actions/CreateSalesReturnAction.php ^
    backend/app/Domains/Commercial/Sales/Actions/ListSalesReturnsAction.php ^
    backend/app/Domains/Commercial/Sales/Models/SalesReturn.php ^
    backend/app/Http/Controllers/Api/V2/Commercial/Purchases ^
    backend/app/Http/Controllers/Api/V2/Commercial/Sales/SalesReturnController.php ^
    backend/app/Http/Requests/Commercial/Purchases ^
    backend/app/Http/Requests/Commercial/Sales/StoreSalesReturnRequest.php ^
    backend/app/Http/Requests/Commercial/Sales/ListSalesReturnsRequest.php ^
    backend/app/Http/Resources/SalesReturnResource.php ^
    backend/app/Models/Purchase.php ^
    backend/app/Models/SalesReturn.php ^
    backend/app/Policies/PurchasePolicy.php ^
    backend/database/factories/PurchaseFactory.php ^
    backend/tests/Feature/Api/PurchasesApiTest.php ^
    backend/tests/Feature/Api/PurchaseRequestsTest.php ^
    backend/tests/Feature/Api/SalesReturnApiTest.php ^
    backend/tests/Feature/Authorization/PurchasePolicyTest.php ^
    backend/tests/Unit/Services/PurchaseServiceTest.php ^
    backend/tests/Unit/Services/SalesServiceTest.php
call :commit_step "feat(procurement): refactor purchasing and returns management"

:: Commit 19: Commercial - Sales Force & Representative Management
git add ^
    backend/app/Domains/Commercial/SalesRepresentatives ^
    backend/app/Domains/Commercial/Sales/Models/SalesRepresentative.php ^
    backend/app/Domains/Commercial/Sales/Models/SalesRepresentativeTransaction.php ^
    backend/app/Http/Controllers/Api/V2/Commercial/SalesRepresentatives ^
    backend/app/Http/Requests/Commercial/SalesRepresentatives ^
    backend/database/factories/SalesRepresentativeFactory.php ^
    backend/database/factories/SalesRepresentativeTransactionFactory.php ^
    backend/tests/Feature/Api/SalesRepresentativeApiTest.php
call :commit_step "feat(sales): migrate sales representative management and ledger"

:: Commit 20: Human Capital - Workforce Administration
git add ^
    backend/app/Domains/HumanCapital/WorkforceAdmin ^
    backend/app/Http/Controllers/Api/V2/HumanCapital/WorkforceAdmin ^
    backend/app/Http/Requests/HumanCapital/WorkforceAdmin ^
    backend/database/factories/EmployeeFactory.php ^
    backend/database/factories/DepartmentFactory.php ^
    backend/tests/Feature/Api/EmployeesApiTest.php ^
    backend/tests/Feature/Hr/HrAdministrationTest.php ^
    backend/tests/Unit/Services/EmployeeAccountServiceTest.php
call :commit_step "feat(hr): refactor workforce administration and employee lifecycle"

:: Commit 21: Human Capital - Payroll & Compensation
git add ^
    backend/app/Domains/HumanCapital/Payroll ^
    backend/app/Http/Controllers/Api/V2/HumanCapital/Payroll ^
    backend/app/Http/Requests/HumanCapital/Payroll ^
    backend/database/factories/BenefitsPlanFactory.php ^
    backend/database/factories/BenefitsEnrollmentFactory.php ^
    backend/database/factories/CompensationEntryFactory.php ^
    backend/database/factories/CompensationPlanFactory.php ^
    backend/tests/Feature/Api/PayrollApiTest.php ^
    backend/tests/Feature/Api/CompensationApiTest.php ^
    backend/tests/Feature/Api/BenefitsApiTest.php ^
    backend/tests/Unit/Services/PayrollServiceTest.php ^
    backend/tests/Unit/Services/SalaryCalculatorServiceTest.php ^
    backend/tests/Unit/Services/EOSBCalculatorServiceTest.php
call :commit_step "feat(payroll): implement upgraded payroll and compensation system"

:: Commit 22: Human Capital - Attendance, Time & Development
git add ^
    backend/app/Domains/HumanCapital/TimeAndAttendance ^
    backend/app/Domains/HumanCapital/TalentAcquisition ^
    backend/app/Domains/HumanCapital/TalentDevelopment ^
    backend/app/Domains/HumanCapital/Communications ^
    backend/app/Domains/HumanCapital/DocumentManagement ^
    backend/app/Http/Controllers/Api/V2/HumanCapital/TimeAndAttendance ^
    backend/app/Http/Controllers/Api/V2/HumanCapital/TalentAcquisition ^
    backend/app/Http/Controllers/Api/V2/HumanCapital/TalentDevelopment ^
    backend/app/Http/Controllers/Api/V2/HumanCapital/Communications ^
    backend/app/Http/Controllers/Api/V2/HumanCapital/DocumentManagement ^
    backend/app/Http/Requests/HumanCapital/TimeAndAttendance ^
    backend/app/Http/Requests/HumanCapital/TalentAcquisition ^
    backend/app/Http/Requests/HumanCapital/TalentDevelopment ^
    backend/app/Http/Requests/HumanCapital/Communications ^
    backend/app/Http/Requests/HumanCapital/DocumentManagement ^
    backend/database/factories/AttendanceRecordFactory.php ^
    backend/database/factories/LeaveRequestFactory.php ^
    backend/tests/Feature/Api/AttendanceApiTest.php ^
    backend/tests/Feature/Api/LeaveApiTest.php ^
    backend/tests/Feature/Hr/BiometricDeviceTest.php ^
    backend/tests/Feature/Hr/DocumentTemplateTest.php ^
    backend/tests/Unit/Services/AttendanceServiceTest.php ^
    backend/tests/Unit/Services/LeaveServiceTest.php
call :commit_step "feat(hc): refactor attendance, talent development, and document services"

:: Commit 23: Supply Chain - Inventory & Manufacturing
git add ^
    backend/app/Domains/SupplyChain ^
    backend/app/Domains/Manufacturing ^
    backend/app/Http/Controllers/Api/V2/SupplyChain ^
    backend/app/Http/Requests/SupplyChain ^
    backend/database/factories/CategoryFactory.php ^
    backend/database/factories/ProductFactory.php ^
    backend/database/seeders/CategorySeeder.php ^
    backend/database/seeders/ProductSeeder.php ^
    backend/tests/Feature/Api/InventoryApiTest.php ^
    backend/tests/Feature/Api/ProductsApiTest.php ^
    backend/tests/Feature/Api/CategoriesApiTest.php ^
    backend/tests/Feature/Api/PeriodicInventoryApiTest.php ^
    backend/tests/Unit/Services/InventoryCostingService*Test.php
call :commit_step "feat(supply-chain): refactor inventory and manufacturing domains"

:: Commit 24: Digital Platform - Automation & Asset Management
git add ^
    backend/app/Domains/DigitalPlatform ^
    backend/app/Domains/AssetManagement ^
    backend/app/Http/Controllers/Api/V2/AssetManagement ^
    backend/app/Http/Controllers/Api/V2/DigitalPlatform ^
    backend/app/Http/Requests/AssetManagement ^
    backend/app/Http/Requests/DigitalPlatform ^
    backend/database/factories/AssetFactory.php ^
    backend/database/factories/TelescopeFactory.php ^
    backend/tests/Feature/Api/AssetsApiTest.php ^
    backend/tests/Unit/Services/DepreciationServiceTest.php ^
    backend/tests/Feature/Api/BatchApiTest.php
call :commit_step "feat(platform): implement automation and asset management services"

:: Commit 25: Restructuring Finalization & V1 Deprecation
:: Catch all remaining routes, docs, and delete old controllers
git add ^
    backend/routes/api.php ^
    backend/routes/api/*.php ^
    backend/routes/domain-loader.php ^
    backend/routes/domains ^
    backend/app/Http/Controllers/Api/*.php ^
    backend/logs ^
    reports ^
    backend/tests/Feature/Api/AuthorizationTest.php ^
    backend/tests/Feature/Api/RateLimitingTest.php ^
    backend/tests/Feature/Api/SessionsApiTest.php ^
    backend/tests/Unit/DebugTest.php
call :commit_step "chore: finalize V2 restructuring and deprecate legacy controllers"

echo V2 Migration completed with 25 commits.
goto :eof

:commit_step
echo Committing: %~1
git commit -m "%~1"
exit /b

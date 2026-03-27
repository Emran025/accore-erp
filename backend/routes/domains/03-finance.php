<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V2\Finance\GeneralLedger\ChartOfAccountsController;
use App\Http\Controllers\Api\V2\Finance\ManagementAccounting\CostProfitCenterController;
use App\Http\Controllers\Api\V2\Finance\ManagementAccounting\ExpensesController;
use App\Http\Controllers\Api\V2\Finance\GeneralLedger\FiscalPeriodsController;
use App\Http\Controllers\Api\V2\Finance\ForeignExchange\CurrencyController;
use App\Http\Controllers\Api\V2\Finance\ForeignExchange\CurrencyPolicyController;
use App\Http\Controllers\Api\V2\Finance\GeneralLedger\GeneralLedgerController;
use App\Http\Controllers\Api\V2\Finance\ManagementAccounting\RevenuesController;
use App\Http\Controllers\Api\V2\Finance\TaxCompliance\TaxEngineController;
use App\Http\Controllers\Api\V2\Finance\Treasury\BankReconciliationController;
use App\Http\Controllers\Api\V2\Finance\Treasury\JournalVouchersController;
use App\Http\Controllers\Api\V2\Finance\TaxCompliance\ZATCAInvoiceController;
use App\Http\Controllers\Api\V2\Finance\GeneralLedger\RecurringTransactionsController;

/*
|--------------------------------------------------------------------------
| Domain Routes: 03-Finance
|--------------------------------------------------------------------------
| Covers: COA, GL, JV, Fiscal Periods, Bank Rec, Expenses, Revenues, 
| Cost/Profit Centers, Currency & Policy, Taxation
|--------------------------------------------------------------------------
*/


// ── General Ledger & COA
Route::middleware('can:general_ledger,view')->group(function () {
    Route::get('/trial-balance', [GeneralLedgerController::class, 'trialBalance'])->name('v2.gl.trial_balance');
    Route::get('/ledger/entries', [GeneralLedgerController::class, 'entries'])->name('v2.gl.entries');
    Route::get('/ledger/account-activity', [GeneralLedgerController::class, 'accountActivity'])->name('v2.gl.account_activity');
    Route::get('/ledger/account-details', [GeneralLedgerController::class, 'accountDetails'])->name('v2.gl.account_details');
    Route::get('/ledger/balance-history', [GeneralLedgerController::class, 'accountBalanceHistory'])->name('v2.gl.balance_history');

    // Recurring Transactions
    Route::group(['prefix' => 'ledger/recurring'], function () {
        Route::get('/', [RecurringTransactionsController::class, 'index'])->name('v2.gl.recurring.index');
        Route::post('/', [RecurringTransactionsController::class, 'store'])->name('v2.gl.recurring.store');
        Route::put('/{id}', [RecurringTransactionsController::class, 'update'])->name('v2.gl.recurring.update');
        Route::delete('/{id}', [RecurringTransactionsController::class, 'destroy'])->name('v2.gl.recurring.destroy');
        Route::post('/process', [RecurringTransactionsController::class, 'process'])->name('v2.gl.recurring.process');
    });
});

Route::group(['prefix' => 'chart-of-accounts', 'middleware' => 'can:chart_of_accounts,view'], function () {
    Route::get('/', [ChartOfAccountsController::class, 'index'])->name('v2.coa.index');
    Route::get('/balances', [ChartOfAccountsController::class, 'balances'])->name('v2.coa.balances');
    Route::middleware(['can:chart_of_accounts,create', 'throttle:api-write'])->post('/', [ChartOfAccountsController::class, 'store'])->name('v2.coa.store');
    Route::middleware(['can:chart_of_accounts,edit', 'throttle:api-write'])->put('/{id}', [ChartOfAccountsController::class, 'update'])->name('v2.coa.update');
    Route::middleware(['can:chart_of_accounts,delete', 'throttle:api-delete'])->delete('/{id}', [ChartOfAccountsController::class, 'destroy'])->name('v2.coa.destroy');
});

// ── Journal Vouchers & Fiscal Periods
Route::group(['prefix' => 'treasury', 'middleware' => 'can:journal_vouchers,view'], function () {
    Route::get('/', [JournalVouchersController::class, 'index'])->name('v2.journal_vouchers.index');
    Route::get('/{id}', [JournalVouchersController::class, 'show'])->name('v2.journal_vouchers.show');
    Route::middleware(['can:journal_vouchers,create', 'throttle:api-sensitive'])->post('/', [JournalVouchersController::class, 'store'])->name('v2.journal_vouchers.store');
    Route::middleware(['can:journal_vouchers,delete', 'throttle:api-delete'])->delete('/{id}', [JournalVouchersController::class, 'delete'])->name('v2.journal_vouchers.destroy');
    Route::middleware(['can:journal_vouchers,edit', 'throttle:api-critical'])->post('/{id}/post', [JournalVouchersController::class, 'post'])->name('v2.vouchers.post');
});

Route::group(['prefix' => 'fiscal-periods', 'middleware' => 'can:fiscal_periods,view'], function () {
    Route::get('/', [FiscalPeriodsController::class, 'index'])->name('v2.fiscal_periods.index');
    Route::middleware(['can:fiscal_periods,create', 'throttle:api-sensitive'])->post('/', [FiscalPeriodsController::class, 'store'])->name('v2.fiscal_periods.store');
    Route::middleware(['can:fiscal_periods,edit', 'throttle:api-critical'])->group(function () {
        Route::post('/{id}/close', [FiscalPeriodsController::class, 'close'])->name('v2.fiscal_periods.close');
        Route::post('/{id}/lock', [FiscalPeriodsController::class, 'lock'])->name('v2.fiscal_periods.lock');
        Route::post('/{id}/unlock', [FiscalPeriodsController::class, 'unlock'])->name('v2.fiscal_periods.unlock');
    });
});

// ── Operations & Subsidiary Ledgers
Route::group(['prefix' => 'operations'], function () {

    // Bank Reconciliation
    Route::group(['prefix' => 'reconciliation', 'middleware' => 'can:reconciliation,view'], function () {
        Route::get('/', [BankReconciliationController::class, 'index'])->name('v2.reconciliation.index');
        Route::middleware(['can:reconciliation,create', 'throttle:api-sensitive'])->post('/', [BankReconciliationController::class, 'store'])->name('v2.reconciliation.store');
        Route::middleware(['can:reconciliation,edit', 'throttle:api-sensitive'])->put('/{id}', [BankReconciliationController::class, 'update'])->name('v2.reconciliation.update');
    });

    // Expenses & Revenues
    Route::group(['middleware' => 'can:expenses,view'], function () {
        Route::get('/expenses', [ExpensesController::class, 'index'])->name('v2.expenses.index');
        Route::middleware(['can:expenses,create', 'throttle:api-write'])->post('/expenses', [ExpensesController::class, 'store'])->name('v2.expenses.store');
        Route::middleware(['can:expenses,edit', 'throttle:api-write'])->put('/expenses/{id}', [ExpensesController::class, 'update'])->name('v2.expenses.update');
        Route::middleware(['can:expenses,delete', 'throttle:api-delete'])->delete('/expenses/{id}', [ExpensesController::class, 'destroy'])->name('v2.expenses.destroy');
    });

    Route::group(['middleware' => 'can:revenues,view'], function () {
        Route::get('/revenues', [RevenuesController::class, 'index'])->name('v2.revenues.index');
        Route::middleware(['can:revenues,create', 'throttle:api-write'])->post('/revenues', [RevenuesController::class, 'store'])->name('v2.revenues.store');
        Route::middleware(['can:revenues,edit', 'throttle:api-write'])->put('/revenues/{id}', [RevenuesController::class, 'update'])->name('v2.revenues.update');
        Route::middleware(['can:revenues,delete', 'throttle:api-delete'])->delete('/revenues/{id}', [RevenuesController::class, 'destroy'])->name('v2.revenues.destroy');
    });
});

// ── Cost & Profit Centers
Route::group(['prefix' => 'centers', 'middleware' => 'can:chart_of_accounts,view'], function () {
    Route::get('/summary', [CostProfitCenterController::class, 'summary'])->name('v2.centers.summary');
    
    Route::group(['prefix' => 'cost'], function () {
        Route::get('/', [CostProfitCenterController::class, 'costCentersIndex'])->name('v2.cost_centers.index');
        Route::get('/tree', [CostProfitCenterController::class, 'costCentersTree'])->name('v2.cost_centers.tree');
        Route::get('/{id}', [CostProfitCenterController::class, 'costCentersShow'])->name('v2.cost_centers.show');
        Route::middleware(['can:chart_of_accounts,create', 'throttle:api-write'])->post('/', [CostProfitCenterController::class, 'costCentersStore'])->name('v2.cost_centers.store');
        Route::middleware(['can:chart_of_accounts,edit', 'throttle:api-write'])->put('/{id}', [CostProfitCenterController::class, 'costCentersUpdate'])->name('v2.cost_centers.update');
        Route::middleware(['can:chart_of_accounts,delete', 'throttle:api-delete'])->delete('/{id}', [CostProfitCenterController::class, 'costCentersDestroy'])->name('v2.cost_centers.destroy');
    });

    Route::group(['prefix' => 'profit'], function () {
        Route::get('/', [CostProfitCenterController::class, 'profitCentersIndex'])->name('v2.profit_centers.index');
        Route::get('/tree', [CostProfitCenterController::class, 'profitCentersTree'])->name('v2.profit_centers.tree');
        Route::get('/{id}', [CostProfitCenterController::class, 'profitCentersShow'])->name('v2.profit_centers.show');
        Route::middleware(['can:chart_of_accounts,create', 'throttle:api-write'])->post('/', [CostProfitCenterController::class, 'profitCentersStore'])->name('v2.profit_centers.store');
        Route::middleware(['can:chart_of_accounts,edit', 'throttle:api-write'])->put('/{id}', [CostProfitCenterController::class, 'profitCentersUpdate'])->name('v2.profit_centers.update');
        Route::middleware(['can:chart_of_accounts,delete', 'throttle:api-delete'])->delete('/{id}', [CostProfitCenterController::class, 'profitCentersDestroy'])->name('v2.profit_centers.destroy');
    });
});

// ── Currency & Treasury
Route::group(['prefix' => 'foreign-exchange', 'middleware' => 'can:currency,view'], function () {
    Route::get('/currencies', [CurrencyController::class, 'index'])->name('v2.currencies.index');
    Route::get('/policies', [CurrencyPolicyController::class, 'index'])->name('v2.currency_policies.index');
    Route::get('/policies/active', [CurrencyPolicyController::class, 'getActivePolicy'])->name('v2.currency_policies.active');
    Route::get('/policies/types', [CurrencyPolicyController::class, 'getPolicyTypes'])->name('v2.currency_policies.types');
    Route::get('/policies/{id}', [CurrencyPolicyController::class, 'show'])->name('v2.currency_policies.show');
    Route::get('/rates/history', [CurrencyPolicyController::class, 'getExchangeRateHistory'])->name('v2.currency_rates.history');

    Route::middleware(['can:currency,create', 'throttle:api-write'])->group(function () {
        Route::post('/currencies', [CurrencyController::class, 'store'])->name('v2.currencies.store');
        Route::post('/policies', [CurrencyPolicyController::class, 'store'])->name('v2.currency_policies.store');
    });
    
    Route::middleware(['can:currency,edit', 'throttle:api-write'])->group(function () {
        Route::post('/currencies/{id}/toggle', [CurrencyController::class, 'toggleActive'])->name('v2.currencies.toggle');
        Route::put('/policies/{id}', [CurrencyPolicyController::class, 'update'])->name('v2.currency_policies.update');
        Route::post('/policies/{id}/activate', [CurrencyPolicyController::class, 'activate'])->name('v2.currency_policies.activate');
        Route::post('/policies/rate', [CurrencyPolicyController::class, 'recordExchangeRate'])->name('v2.currency_rates.record');
        Route::post('/policies/revaluate', [CurrencyPolicyController::class, 'processRevaluation'])->name('v2.currency_rates.revaluate');
    });

    Route::middleware(['can:currency,delete', 'throttle:api-delete'])->group(function () {
        Route::delete('/policies/{id}', [CurrencyPolicyController::class, 'destroy'])->name('v2.currency_policies.destroy');
    });

    // ── Treasury Operations
    Route::get('/rates/exchange-history', [CurrencyPolicyController::class, 'getExchangeRateHistory'])->name('v2.treasury.rates_history');
    Route::middleware(['can:currency,edit', 'throttle:api-write'])->group(function () {
        Route::post('/convert', [CurrencyPolicyController::class, 'convert'])->name('v2.treasury.convert');
        Route::post('/revaluation', [CurrencyPolicyController::class, 'processRevaluation'])->name('v2.treasury.revaluation');
        Route::post('/currencies/{id}/toggle-active', [CurrencyController::class, 'toggleActive'])->name('v2.treasury.toggle_active');
    });
});

// ── Unified Tax Engine
Route::group(['prefix' => 'tax-engine', 'middleware' => 'can:settings,view'], function () {
    Route::get('/setup', [TaxEngineController::class, 'getSetup'])->name('v2.tax_engine.setup');
    Route::middleware(['can:settings,edit', 'throttle:api-write'])->group(function () {
        Route::put('/authorities/{id}', [TaxEngineController::class, 'updateAuthority'])->name('v2.tax_engine.authorities.update');
        Route::post('/types', [TaxEngineController::class, 'storeTaxType'])->name('v2.tax_engine.types.store');
        Route::put('/types/{id}', [TaxEngineController::class, 'updateTaxType'])->name('v2.tax_engine.types.update');
        Route::delete('/types/{id}', [TaxEngineController::class, 'destroyTaxType'])->name('v2.tax_engine.types.destroy');
    });
});

// ZATCA Integration
Route::group(['prefix' => 'zatca'], function () {
    Route::post('/invoices/{id}/submit', [ZATCAInvoiceController::class, 'submit'])->name('v2.zatca.submit');
    Route::get('/invoices/{id}/status', [ZATCAInvoiceController::class, 'getStatus'])->name('v2.zatca.status');
});


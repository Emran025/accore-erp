<?php

use Illuminate\Support\Facades\Route;

use App\Domains\Finance\ChartOfAccounts\Actions\{
    ListChartOfAccountsAction, CreateChartOfAccountAction, UpdateChartOfAccountAction,
    DeleteChartOfAccountAction, GetChartOfAccountBalancesAction
};
use App\Domains\Finance\GeneralLedger\Actions\{
    GetTrialBalanceAction, ListGlEntriesAction, GetAccountDetailsAction,
    GetAccountActivityAction, GetAccountBalanceHistoryAction
};
use App\Domains\Finance\JournalVouchers\Actions\{
    ListJournalVouchersAction, CreateJournalVoucherAction, ShowJournalVoucherAction,
    DeleteJournalVoucherAction, PostJournalVoucherAction, ReverseJournalVoucherAction
};
use App\Domains\Finance\FiscalPeriods\Actions\{
    ListFiscalPeriodsAction, CreateFiscalPeriodAction, CloseFiscalPeriodAction,
    LockFiscalPeriodAction, UnlockFiscalPeriodAction
};
use App\Domains\Finance\Accrual\Actions\{
    ListAccrualsAction, CreateAccrualAction, UpdateAccrualAction
};
use App\Domains\Finance\BankReconciliation\Actions\{
    ListReconciliationsAction, CreateReconciliationAction, UpdateReconciliationAction
};
use App\Domains\Finance\Expenses\Actions\{
    ListExpensesAction, CreateExpenseAction, UpdateExpenseAction, DeleteExpenseAction
};
use App\Domains\Finance\Revenues\Actions\{
    ListRevenuesAction, CreateRevenueAction, UpdateRevenueAction, DeleteRevenueAction
};
use App\Domains\Finance\CostProfitCenters\Actions\{
    ListCostCentersAction, CreateCostCenterAction, UpdateCostCenterAction, DeleteCostCenterAction,
    ShowCostCenterAction, GetCostCentersTreeAction, ListProfitCentersAction, CreateProfitCenterAction,
    UpdateProfitCenterAction, DeleteProfitCenterAction, ShowProfitCenterAction, GetProfitCentersTreeAction,
    GetCentersSummaryAction
};
use App\Domains\Finance\Currency\Actions\{
    ListCurrenciesAction, CreateCurrencyAction, UpdateCurrencyAction, DeleteCurrencyAction,
    ToggleCurrencyStatusAction, SetPrimaryCurrencyAction
};
use App\Domains\Finance\CurrencyPolicy\Actions\{
    ListCurrencyPoliciesAction, GetActiveCurrencyPolicyAction, CreateCurrencyPolicyAction,
    ShowCurrencyPolicyAction, UpdateCurrencyPolicyAction, ActivateCurrencyPolicyAction,
    DeleteCurrencyPolicyAction, GetExchangeRateHistoryAction, RecordExchangeRateAction,
    GetExchangeRateAction, ConvertAmountAction, ProcessRevaluationAction, GetCurrencyPolicyTypesAction
};
use App\Domains\Finance\Taxation\Actions\{
    GetTaxSetupAction, UpdateTaxAuthorityAction, CreateTaxTypeAction, UpdateTaxTypeAction, DeleteTaxTypeAction
};
use App\Domains\Finance\Treasury\Actions\{
    ConvertCurrencyAction, ListExchangeRateHistoryAction,
    ProcessCurrencyRevaluationAction, ToggleCurrencyActiveAction
};

/*
|--------------------------------------------------------------------------
| Domain Routes: 03-Finance
|--------------------------------------------------------------------------
| Covers: COA, GL, JV, Fiscal Periods, Accruals, Bank Rec, Expenses, 
| Revenues, Cost/Profit Centers, Currency & Policy, Taxation
|--------------------------------------------------------------------------
*/

Route::group(['prefix' => 'v2', 'middleware' => ['api.auth', 'throttle:api']], function () {

    // ── General Ledger & COA
    Route::middleware('can:general_ledger,view')->group(function () {
        Route::get('/trial-balance', GetTrialBalanceAction::class)->name('v2.gl.trial_balance');
        Route::get('/ledger/entries', ListGlEntriesAction::class)->name('v2.gl.entries');
        Route::get('/ledger/account-activity', GetAccountActivityAction::class)->name('v2.gl.account_activity');
        Route::get('/ledger/account-details', GetAccountDetailsAction::class)->name('v2.gl.account_details');
        Route::get('/ledger/balance-history', GetAccountBalanceHistoryAction::class)->name('v2.gl.balance_history');
    });

    Route::group(['prefix' => 'chart-of-accounts', 'middleware' => 'can:chart_of_accounts,view'], function () {
        Route::get('/', ListChartOfAccountsAction::class)->name('v2.coa.index');
        Route::get('/balances', GetChartOfAccountBalancesAction::class)->name('v2.coa.balances');
        Route::middleware(['can:chart_of_accounts,create', 'throttle:api-write'])->post('/', CreateChartOfAccountAction::class)->name('v2.coa.store');
        Route::middleware(['can:chart_of_accounts,edit', 'throttle:api-write'])->put('/{id}', function (Illuminate\Http\Request $request, $id) {
            return app()->make(UpdateChartOfAccountAction::class, ['request' => $request, 'id' => (int) $id])();
        })->name('v2.coa.update');
        Route::middleware(['can:chart_of_accounts,delete', 'throttle:api-delete'])->delete('/{id}', function ($id) {
            return app()->make(DeleteChartOfAccountAction::class, ['id' => (int) $id])();
        })->name('v2.coa.destroy');
    });

    // ── Journal Vouchers & Fiscal Periods
    Route::group(['prefix' => 'journal-vouchers', 'middleware' => 'can:journal_vouchers,view'], function () {
        Route::get('/', ListJournalVouchersAction::class)->name('v2.journal_vouchers.index');
        Route::get('/{id}', function ($id) { return app()->make(ShowJournalVoucherAction::class, ['id' => (int) $id])(); })->name('v2.journal_vouchers.show');
        Route::middleware(['can:journal_vouchers,create', 'throttle:api-sensitive'])->post('/', CreateJournalVoucherAction::class)->name('v2.journal_vouchers.store');
        Route::middleware(['can:journal_vouchers,delete', 'throttle:api-delete'])->delete('/{id}', function ($id) { return app()->make(DeleteJournalVoucherAction::class, ['id' => (int) $id])(); })->name('v2.journal_vouchers.destroy');
        Route::middleware(['can:journal_vouchers,edit', 'throttle:api-critical'])->post('/{id}/post', function ($id) {
            return app()->make(PostJournalVoucherAction::class, ['id' => (int) $id, 'ledgerService' => app(\App\Domains\Finance\GeneralLedger\Services\LedgerService::class)])();
        })->name('v2.vouchers.post');
    });

    Route::group(['prefix' => 'fiscal-periods', 'middleware' => 'can:fiscal_periods,view'], function () {
        Route::get('/', ListFiscalPeriodsAction::class)->name('v2.fiscal_periods.index');
        Route::middleware(['can:fiscal_periods,create', 'throttle:api-sensitive'])->post('/', CreateFiscalPeriodAction::class)->name('v2.fiscal_periods.store');
        Route::middleware(['can:fiscal_periods,edit', 'throttle:api-critical'])->group(function () {
            Route::post('/close', CloseFiscalPeriodAction::class)->name('v2.fiscal_periods.close');
            Route::post('/lock', LockFiscalPeriodAction::class)->name('v2.fiscal_periods.lock');
            Route::post('/unlock', UnlockFiscalPeriodAction::class)->name('v2.fiscal_periods.unlock');
        });
    });

    // ── Operations & Subsidiary Ledgers
    Route::group(['prefix' => 'operations'], function () {
        // Accrual
        Route::group(['prefix' => 'accrual', 'middleware' => 'can:accrual_accounting,view'], function () {
            Route::get('/', ListAccrualsAction::class)->name('v2.accrual.index');
            Route::middleware(['can:accrual_accounting,create', 'throttle:api-sensitive'])->post('/', CreateAccrualAction::class)->name('v2.accrual.store');
            Route::middleware(['can:accrual_accounting,edit', 'throttle:api-sensitive'])->put('/', UpdateAccrualAction::class)->name('v2.accrual.update');
        });

        // Bank Reconciliation
        Route::group(['prefix' => 'reconciliation', 'middleware' => 'can:reconciliation,view'], function () {
            Route::get('/', ListReconciliationsAction::class)->name('v2.reconciliation.index');
            Route::middleware(['can:reconciliation,create', 'throttle:api-sensitive'])->post('/', CreateReconciliationAction::class)->name('v2.reconciliation.store');
            Route::middleware(['can:reconciliation,edit', 'throttle:api-sensitive'])->put('/', UpdateReconciliationAction::class)->name('v2.reconciliation.update');
        });

        // Expenses & Revenues
        Route::group(['middleware' => 'can:expenses,view'], function () {
            Route::get('/expenses', ListExpensesAction::class)->name('v2.expenses.index');
            Route::middleware(['can:expenses,create', 'throttle:api-write'])->post('/expenses', CreateExpenseAction::class)->name('v2.expenses.store');
            Route::middleware(['can:expenses,edit', 'throttle:api-write'])->put('/expenses', UpdateExpenseAction::class)->name('v2.expenses.update');
            Route::middleware(['can:expenses,delete', 'throttle:api-delete'])->delete('/expenses', DeleteExpenseAction::class)->name('v2.expenses.destroy');
        });

        Route::group(['middleware' => 'can:revenues,view'], function () {
            Route::get('/revenues', ListRevenuesAction::class)->name('v2.revenues.index');
            Route::middleware(['can:revenues,create', 'throttle:api-write'])->post('/revenues', CreateRevenueAction::class)->name('v2.revenues.store');
            Route::middleware(['can:revenues,edit', 'throttle:api-write'])->put('/revenues', UpdateRevenueAction::class)->name('v2.revenues.update');
            Route::middleware(['can:revenues,delete', 'throttle:api-delete'])->delete('/revenues', DeleteRevenueAction::class)->name('v2.revenues.destroy');
        });
    });

    // ── Cost & Profit Centers
    Route::group(['prefix' => 'centers', 'middleware' => 'can:chart_of_accounts,view'], function () {
        Route::get('/summary', GetCentersSummaryAction::class)->name('v2.centers.summary');
        
        Route::group(['prefix' => 'cost'], function () {
            Route::get('/', ListCostCentersAction::class)->name('v2.cost_centers.index');
            Route::get('/tree', GetCostCentersTreeAction::class)->name('v2.cost_centers.tree');
            Route::get('/{id}', function ($id) { return app()->make(ShowCostCenterAction::class, ['id' => (int) $id])(); })->name('v2.cost_centers.show');
            Route::middleware(['can:chart_of_accounts,create', 'throttle:api-write'])->post('/', CreateCostCenterAction::class)->name('v2.cost_centers.store');
            Route::middleware(['can:chart_of_accounts,edit', 'throttle:api-write'])->put('/{id}', function (Illuminate\Http\Request $request, $id) {
                return app()->make(UpdateCostCenterAction::class, ['request' => $request, 'id' => (int) $id])();
            })->name('v2.cost_centers.update');
            Route::middleware(['can:chart_of_accounts,delete', 'throttle:api-delete'])->delete('/{id}', function ($id) { return app()->make(DeleteCostCenterAction::class, ['id' => (int) $id])(); })->name('v2.cost_centers.destroy');
        });

        Route::group(['prefix' => 'profit'], function () {
            Route::get('/', ListProfitCentersAction::class)->name('v2.profit_centers.index');
            Route::get('/tree', GetProfitCentersTreeAction::class)->name('v2.profit_centers.tree');
            Route::get('/{id}', function ($id) { return app()->make(ShowProfitCenterAction::class, ['id' => (int) $id])(); })->name('v2.profit_centers.show');
            Route::middleware(['can:chart_of_accounts,create', 'throttle:api-write'])->post('/', CreateProfitCenterAction::class)->name('v2.profit_centers.store');
            Route::middleware(['can:chart_of_accounts,edit', 'throttle:api-write'])->put('/{id}', function (Illuminate\Http\Request $request, $id) {
                return app()->make(UpdateProfitCenterAction::class, ['request' => $request, 'id' => (int) $id])();
            })->name('v2.profit_centers.update');
            Route::middleware(['can:chart_of_accounts,delete', 'throttle:api-delete'])->delete('/{id}', function ($id) { return app()->make(DeleteProfitCenterAction::class, ['id' => (int) $id])(); })->name('v2.profit_centers.destroy');
        });
    });

    // ── Currency & Treasury
    Route::group(['prefix' => 'treasury', 'middleware' => 'can:currency,view'], function () {
        Route::get('/currencies', ListCurrenciesAction::class)->name('v2.currencies.index');
        Route::get('/policies', ListCurrencyPoliciesAction::class)->name('v2.currency_policies.index');
        Route::get('/policies/active', GetActiveCurrencyPolicyAction::class)->name('v2.currency_policies.active');
        Route::get('/rates/history', GetExchangeRateHistoryAction::class)->name('v2.currency_rates.history');

        Route::middleware(['can:currency,create', 'throttle:api-write'])->post('/currencies', CreateCurrencyAction::class)->name('v2.currencies.store');
        Route::middleware(['can:currency,edit', 'throttle:api-write'])->group(function () {
            Route::post('/currencies/{id}/toggle', function ($id) { return app()->make(ToggleCurrencyStatusAction::class, ['id' => (int) $id])(); })->name('v2.currencies.toggle');
            Route::post('/policies/rate', RecordExchangeRateAction::class)->name('v2.currency_rates.record');
            Route::post('/policies/revaluate', ProcessRevaluationAction::class)->name('v2.currency_rates.revaluate');
        });

        // ── Treasury Operations
        Route::get('/rates/exchange-history', ListExchangeRateHistoryAction::class)->name('v2.treasury.rates_history');
        Route::middleware(['can:currency,edit', 'throttle:api-write'])->group(function () {
            Route::post('/convert', ConvertCurrencyAction::class)->name('v2.treasury.convert');
            Route::post('/revaluation', ProcessCurrencyRevaluationAction::class)->name('v2.treasury.revaluation');
            Route::post('/currencies/{id}/toggle-active', function ($id) {
                return app()->make(ToggleCurrencyActiveAction::class, ['id' => (int) $id])();
            })->name('v2.treasury.toggle_active');
        });
    });

    // ── Unified Tax Engine
    Route::group(['prefix' => 'tax-engine', 'middleware' => 'can:settings,view'], function () {
        Route::get('/setup', GetTaxSetupAction::class)->name('v2.tax_engine.setup');
        Route::middleware(['can:settings,edit', 'throttle:api-write'])->group(function () {
            Route::put('/authorities/{id}', function (Illuminate\Http\Request $request, $id) {
                return app()->make(UpdateTaxAuthorityAction::class, ['request' => $request, 'id' => (int)$id])();
            })->name('v2.tax_engine.authorities.update');
            Route::post('/types', CreateTaxTypeAction::class)->name('v2.tax_engine.types.store');
            Route::put('/types/{id}', function (Illuminate\Http\Request $request, $id) {
                return app()->make(UpdateTaxTypeAction::class, ['request' => $request, 'id' => (int)$id])();
            })->name('v2.tax_engine.types.update');
            Route::delete('/types/{id}', function ($id) { return app()->make(DeleteTaxTypeAction::class, ['id' => (int)$id])(); })->name('v2.tax_engine.types.destroy');
        });
    });

});

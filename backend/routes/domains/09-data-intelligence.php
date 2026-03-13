<?php

use Illuminate\Support\Facades\Route;
use App\Domains\DataIntelligence\Actions\{
    GetDashboardDataAction, GetBalanceSheetAction, GetProfitLossAction, GetAgingReportAction
};
use App\Domains\DataIntelligence\Dashboards\Actions\ShowExecutiveDashboardAction;
use App\Domains\DataIntelligence\Reports\Actions\{
    GenerateAgingPayablesReportAction, GenerateAgingReceivablesReportAction,
    GenerateBalanceSheetReportAction, GenerateCashFlowReportAction,
    GenerateComparativeFinancialReportAction, GenerateProfitLossReportAction
};

/*
|--------------------------------------------------------------------------
| Domain Routes: 09-DataIntelligence
|--------------------------------------------------------------------------
| Covers: Dashboards, Reports (Financial, Operational), Analytics
|--------------------------------------------------------------------------
*/

Route::group(['prefix' => 'v2', 'middleware' => ['api.auth', 'throttle:api']], function () {

    // ── Dashboard
    Route::get('/analytics/dashboard', GetDashboardDataAction::class)->name('v2.dashboard.index');
    Route::get('/analytics/executive-dashboard', ShowExecutiveDashboardAction::class)->name('v2.dashboard.executive');

    // ── Reports
    Route::group(['prefix' => 'analytics/reports', 'middleware' => 'can:general_ledger,view'], function () {
        Route::get('/balance-sheet', GetBalanceSheetAction::class)->name('v2.reports.balance_sheet');
        Route::get('/profit-loss', GetProfitLossAction::class)->name('v2.reports.profit_loss');
        Route::get('/aging', GetAgingReportAction::class)->name('v2.reports.aging');

        // ── Advanced Financial Reports
        Route::get('/aging-payables', GenerateAgingPayablesReportAction::class)->name('v2.reports.aging_payables');
        Route::get('/aging-receivables', GenerateAgingReceivablesReportAction::class)->name('v2.reports.aging_receivables');
        Route::get('/balance-sheet-detailed', GenerateBalanceSheetReportAction::class)->name('v2.reports.balance_sheet_detailed');
        Route::get('/cash-flow', GenerateCashFlowReportAction::class)->name('v2.reports.cash_flow');
        Route::get('/comparative', GenerateComparativeFinancialReportAction::class)->name('v2.reports.comparative');
        Route::get('/profit-loss-detailed', GenerateProfitLossReportAction::class)->name('v2.reports.profit_loss_detailed');
    });

});

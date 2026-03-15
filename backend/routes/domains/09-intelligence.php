<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V2\Intelligence\BusinessIntelligence\DashboardController;
use App\Http\Controllers\Api\V2\Intelligence\AdvancedAnalytics\ReportsController;

/*
|--------------------------------------------------------------------------
| Domain Routes: 09-DataIntelligence
|--------------------------------------------------------------------------
| Covers: Dashboards, Reports (Financial, Operational), Analytics
|--------------------------------------------------------------------------
*/


// ── Dashboard
Route::get('/analytics/dashboard', [DashboardController::class, 'index'])->name('v2.dashboard.index');
Route::get('/dashboard', [DashboardController::class, 'index'])->name('v2.dashboard.legacy'); // Alias
Route::get('/analytics/executive-dashboard', [DashboardController::class, 'executive'])->name('v2.dashboard.executive');

// ── Reports
Route::group(['prefix' => 'analytics/reports', 'middleware' => 'can:general_ledger,view'], function () {
    Route::get('/balance-sheet', [ReportsController::class, 'balanceSheet'])->name('v2.reports.balance_sheet');
    Route::get('/profit-loss', [ReportsController::class, 'profitLoss'])->name('v2.reports.profit_loss');
    Route::get('/aging', [ReportsController::class, 'aging'])->name('v2.reports.aging');

    // ── Advanced Financial Reports
    Route::get('/aging-payables', [ReportsController::class, 'agingPayables'])->name('v2.reports.aging_payables');
    Route::get('/aging-receivables', [ReportsController::class, 'agingReceivables'])->name('v2.reports.aging_receivables');
    Route::get('/balance-sheet-detailed', [ReportsController::class, 'balanceSheetDetailed'])->name('v2.reports.balance_sheet_detailed');
    Route::get('/cash-flow', [ReportsController::class, 'cashFlow'])->name('v2.reports.cash_flow');
    Route::get('/comparative', [ReportsController::class, 'comparative'])->name('v2.reports.comparative');
    Route::get('/profit-loss-detailed', [ReportsController::class, 'profitLossDetailed'])->name('v2.reports.profit_loss_detailed');
    
    // ── Legacy Compatibility Aliases
    Route::group(['prefix' => 'legacy'], function () {
        Route::get('/reports/balance_sheet', [ReportsController::class, 'balanceSheet'])->name('v2.legacy.reports.balance_sheet');
        Route::get('/reports/profit_loss', [ReportsController::class, 'profitLoss'])->name('v2.legacy.reports.profit_loss');
        Route::get('/reports/cash_flow', [ReportsController::class, 'cashFlow'])->name('v2.legacy.reports.cash_flow');
        Route::get('/reports/aging_receivables', [ReportsController::class, 'agingReceivables'])->name('v2.legacy.reports.aging_receivables');
        Route::get('/reports/aging_payables', [ReportsController::class, 'agingPayables'])->name('v2.legacy.reports.aging_payables');
        Route::get('/reports/comparative', [ReportsController::class, 'comparative'])->name('v2.legacy.reports.comparative');
    });
});

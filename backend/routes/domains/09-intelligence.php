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

Route::group(['prefix' => 'v2', 'middleware' => ['api.auth', 'throttle:api']], function () {

    // ── Dashboard
    Route::get('/analytics/dashboard', [DashboardController::class, 'index'])->name('v2.dashboard.index');
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
    });

});

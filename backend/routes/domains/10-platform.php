<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V2\Platform\Automation\BatchController;
use App\Http\Controllers\Api\V2\Platform\Automation\RecurringTransactionController;
use App\Http\Controllers\Api\V2\EnterpriseCore\OrganizationGovernance\ComplianceProfileController;

/*
|--------------------------------------------------------------------------
| Domain Routes: 10-Platform (Administration & Digital Infrastructure)
|--------------------------------------------------------------------------
| Covers: Automation (Batches, Recurring), Compliance (Structures, Sync)
|--------------------------------------------------------------------------
*/

Route::group(['prefix' => 'v2', 'middleware' => ['api.auth', 'throttle:api']], function () {

    Route::group(['prefix' => 'platform', 'middleware' => 'can:settings,view'], function () {

        // ── Automation Engine
        Route::group(['prefix' => 'automation'], function () {
            // Batch Processing
            Route::get('/batches', [BatchController::class, 'index'])->name('v2.platform.batches.index');
            Route::get('/batches/{id}', [BatchController::class, 'show'])->name('v2.platform.batches.show');
            Route::post('/batches', [BatchController::class, 'store'])->name('v2.platform.batches.store');
            Route::post('/batches/{id}/execute', [BatchController::class, 'execute'])->name('v2.platform.batches.execute');
            Route::delete('/batches/{id}', [BatchController::class, 'destroy'])->name('v2.platform.batches.destroy');

            // Recurring Transactions
            Route::get('/recurring', [RecurringTransactionController::class, 'index'])->name('v2.platform.recurring.index');
            Route::post('/recurring', [RecurringTransactionController::class, 'store'])->name('v2.platform.recurring.store');
            Route::put('/recurring/{id}', [RecurringTransactionController::class, 'update'])->name('v2.platform.recurring.update');
            Route::delete('/recurring/{id}', [RecurringTransactionController::class, 'destroy'])->name('v2.platform.recurring.destroy');
            Route::post('/recurring/process', [RecurringTransactionController::class, 'process'])->name('v2.platform.recurring.process');
        });

        // ── Compliance & Data Governance
        Route::group(['prefix' => 'compliance'], function() {
            Route::get('/profiles', [ComplianceProfileController::class, 'index'])->name('v2.platform.compliance.index');
            Route::get('/profiles/{id}', [ComplianceProfileController::class, 'show'])->name('v2.platform.compliance.show');
            Route::post('/profiles', [ComplianceProfileController::class, 'store'])->name('v2.platform.compliance.store');
            Route::put('/profiles/{id}', [ComplianceProfileController::class, 'update'])->name('v2.platform.compliance.update');
            Route::delete('/profiles/{id}', [ComplianceProfileController::class, 'destroy'])->name('v2.platform.compliance.destroy');

            Route::post('/profiles/{id}/token', [ComplianceProfileController::class, 'generateToken'])->name('v2.platform.compliance.token.generate');
            Route::delete('/profiles/{id}/token', [ComplianceProfileController::class, 'revokeToken'])->name('v2.platform.compliance.token.revoke');
            
            Route::get('/keys', [ComplianceProfileController::class, 'getSystemKeys'])->name('v2.platform.compliance.keys');
            Route::post('/validate', [ComplianceProfileController::class, 'validateStructure'])->name('v2.platform.compliance.validate');
            Route::post('/pull-data', [ComplianceProfileController::class, 'servePullData'])->name('v2.platform.compliance.pull');
        });
    });

});

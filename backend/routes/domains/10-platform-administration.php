<?php

use Illuminate\Support\Facades\Route;
use App\Domains\DigitalPlatform\Automation\Actions\{
    ListBatchesAction, CreateBatchAction, ShowBatchAction, DeleteBatchAction, ExecuteBatchAction,
    ListRecurringTransactionsAction, CreateRecurringTransactionAction, UpdateRecurringTransactionAction,
    DeleteRecurringTransactionAction, ProcessRecurringTransactionAction
};
use App\Domains\DigitalPlatform\Compliance\Actions\{
    ListComplianceProfilesAction, ShowComplianceProfileAction, CreateComplianceProfileAction,
    UpdateComplianceProfileAction, DeleteComplianceProfileAction, GenerateComplianceProfileTokenAction,
    RevokeComplianceProfileTokenAction, ServeCompliancePullDataAction, ValidateComplianceStructureAction,
    GetComplianceSystemKeysAction
};

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
            Route::get('/batches', ListBatchesAction::class)->name('v2.platform.batches.index');
            Route::get('/batches/{id}', function ($id) { return app()->make(ShowBatchAction::class, ['id' => (int)$id])(); })->name('v2.platform.batches.show');
            Route::post('/batches', CreateBatchAction::class)->name('v2.platform.batches.store');
            Route::post('/batches/{id}/execute', function ($id) { return app()->make(ExecuteBatchAction::class, ['id' => (int)$id])(); })->name('v2.platform.batches.execute');
            Route::delete('/batches/{id}', function ($id) { return app()->make(DeleteBatchAction::class, ['id' => (int)$id])(); })->name('v2.platform.batches.destroy');

            // Recurring Transactions
            Route::get('/recurring', ListRecurringTransactionsAction::class)->name('v2.platform.recurring.index');
            Route::post('/recurring', CreateRecurringTransactionAction::class)->name('v2.platform.recurring.store');
            Route::put('/recurring/{id}', function (Illuminate\Http\Request $request, $id) {
                return app()->make(UpdateRecurringTransactionAction::class, ['request' => $request, 'id' => (int)$id])();
            })->name('v2.platform.recurring.update');
            Route::delete('/recurring/{id}', function ($id) { return app()->make(DeleteRecurringTransactionAction::class, ['id' => (int)$id])(); })->name('v2.platform.recurring.destroy');
            Route::post('/recurring/process', ProcessRecurringTransactionAction::class)->name('v2.platform.recurring.process');
        });

        // ── Compliance & Data Governance
        Route::group(['prefix' => 'compliance'], function() {
            Route::get('/profiles', ListComplianceProfilesAction::class)->name('v2.platform.compliance.index');
            Route::get('/profiles/{id}', function ($id) { return app()->make(ShowComplianceProfileAction::class, ['id' => (int)$id])(); })->name('v2.platform.compliance.show');
            Route::post('/profiles', CreateComplianceProfileAction::class)->name('v2.platform.compliance.store');
            Route::put('/profiles/{id}', function (Illuminate\Http\Request $request, $id) {
                return app()->make(UpdateComplianceProfileAction::class, ['request' => $request, 'id' => (int)$id])();
            })->name('v2.platform.compliance.update');
            Route::delete('/profiles/{id}', function ($id) { return app()->make(DeleteComplianceProfileAction::class, ['id' => (int)$id])(); })->name('v2.platform.compliance.destroy');

            Route::post('/profiles/{id}/token', function ($id) { return app()->make(GenerateComplianceProfileTokenAction::class, ['id' => (int)$id])(); })->name('v2.platform.compliance.token.generate');
            Route::delete('/profiles/{id}/token', function ($id) { return app()->make(RevokeComplianceProfileTokenAction::class, ['id' => (int)$id])(); })->name('v2.platform.compliance.token.revoke');
            
            Route::get('/keys', GetComplianceSystemKeysAction::class)->name('v2.platform.compliance.keys');
            Route::post('/validate', ValidateComplianceStructureAction::class)->name('v2.platform.compliance.validate');
            Route::post('/pull-data', ServeCompliancePullDataAction::class)->name('v2.platform.compliance.pull');
        });
    });

});

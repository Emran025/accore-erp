<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V2\Assets\AssetsController;

/*
|--------------------------------------------------------------------------
| Domain Routes: 08-AssetManagement
|--------------------------------------------------------------------------
*/

Route::group(['prefix' => 'v2', 'middleware' => ['api.auth', 'throttle:api']], function () {

    Route::group(['prefix' => 'assets', 'middleware' => 'can:assets,view'], function () {
        Route::get('/', [AssetsController::class, 'index'])->name('v2.assets.index');
        Route::middleware(['can:assets,create', 'throttle:api-write'])->post('/', [AssetsController::class, 'store'])->name('v2.assets.store');
        Route::middleware(['can:assets,edit', 'throttle:api-write'])->put('/{id}', [AssetsController::class, 'update'])->name('v2.assets.update');
        Route::middleware(['can:assets,delete', 'throttle:api-delete'])->delete('/{id}', [AssetsController::class, 'destroy'])->name('v2.assets.destroy');
    });

});

<?php

use Illuminate\Support\Facades\Route;
use App\Domains\AssetManagement\Actions\{
    ListAssetsAction, CreateAssetAction, UpdateAssetAction, DeleteAssetAction
};

/*
|--------------------------------------------------------------------------
| Domain Routes: 08-AssetManagement
|--------------------------------------------------------------------------
*/

Route::group(['prefix' => 'v2', 'middleware' => ['api.auth', 'throttle:api']], function () {

    Route::group(['prefix' => 'assets', 'middleware' => 'can:assets,view'], function () {
        Route::get('/', ListAssetsAction::class)->name('v2.assets.index');
        Route::middleware(['can:assets,create', 'throttle:api-write'])->post('/', CreateAssetAction::class)->name('v2.assets.store');
        Route::middleware(['can:assets,edit', 'throttle:api-write'])->put('/{id}', function (Illuminate\Http\Request $request, $id) {
            return app()->make(UpdateAssetAction::class, ['request' => $request, 'id' => (int)$id])();
        })->name('v2.assets.update');
        Route::middleware(['can:assets,delete', 'throttle:api-delete'])->delete('/{id}', function ($id) {
            return app()->make(DeleteAssetAction::class, ['id' => (int)$id])();
        })->name('v2.assets.destroy');
    });

});

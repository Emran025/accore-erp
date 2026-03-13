<?php

use Illuminate\Support\Facades\Route;
use App\Domains\SupplyChain\Inventory\Actions\{
    ListProductsAction, CreateProductAction, UpdateProductAction, DeleteProductAction,
    ListCategoriesAction, CreateCategoryAction, UpdateCategoryAction, DeleteCategoryAction,
    ListBatchProcessesAction, CreateBatchProcessAction, DeleteBatchProcessAction,
    ListPeriodicInventoryAction, CreatePeriodicInventoryAction, ProcessPeriodicInventoryAction,
    PeriodicInventoryValuationAction
};

/*
|--------------------------------------------------------------------------
| Domain Routes: 04-SupplyChain
|--------------------------------------------------------------------------
| Covers: Inventory, Products, Categories, Batch Processing
|--------------------------------------------------------------------------
*/

Route::group(['prefix' => 'v2', 'middleware' => ['api.auth', 'throttle:api']], function () {

    // ── Inventory Management
    Route::group(['prefix' => 'inventory', 'middleware' => 'can:products,view'], function () {
        
        // Products
        Route::group(['prefix' => 'products'], function () {
            Route::get('/', ListProductsAction::class)->name('v2.inventory.products.index');
            Route::middleware(['can:products,create', 'throttle:api-write'])->post('/', CreateProductAction::class)->name('v2.inventory.products.store');
            Route::middleware(['can:products,edit', 'throttle:api-write'])->put('/', UpdateProductAction::class)->name('v2.inventory.products.update');
            Route::middleware(['can:products,delete', 'throttle:api-delete'])->delete('/', DeleteProductAction::class)->name('v2.inventory.products.destroy');
        });

        // Categories
        Route::group(['prefix' => 'categories'], function () {
            Route::get('/', ListCategoriesAction::class)->name('v2.inventory.categories.index');
            Route::middleware(['can:products,create', 'throttle:api-write'])->post('/', CreateCategoryAction::class)->name('v2.inventory.categories.store');
            Route::middleware(['can:products,edit', 'throttle:api-write'])->put('/{id}', function (Illuminate\Http\Request $request, $id) {
                return app()->make(UpdateCategoryAction::class, ['request' => $request, 'id' => (int)$id])();
            })->name('v2.inventory.categories.update');
            Route::middleware(['can:products,delete', 'throttle:api-delete'])->delete('/{id}', function ($id) {
                return app()->make(DeleteCategoryAction::class, ['id' => (int)$id])();
            })->name('v2.inventory.categories.destroy');
        });

        // Periodic Inventory
        Route::group(['prefix' => 'periodic'], function () {
            Route::get('/', ListPeriodicInventoryAction::class)->name('v2.inventory.periodic.index');
            Route::get('/valuation', PeriodicInventoryValuationAction::class)->name('v2.inventory.periodic.valuation');
            Route::middleware(['can:products,create', 'throttle:api-write'])->post('/', CreatePeriodicInventoryAction::class)->name('v2.inventory.periodic.store');
            Route::middleware(['can:products,edit', 'throttle:api-critical'])->post('/process', ProcessPeriodicInventoryAction::class)->name('v2.inventory.periodic.process');
        });

    });

    // ── Batch Processing
    Route::group(['prefix' => 'batch', 'middleware' => 'can:batch_processing,view'], function () {
        Route::get('/', ListBatchProcessesAction::class)->name('v2.batch.index');
        Route::middleware(['can:batch_processing,create', 'throttle:api-critical'])->post('/', CreateBatchProcessAction::class)->name('v2.batch.store');
        Route::middleware(['can:batch_processing,delete', 'throttle:api-delete'])->delete('/', DeleteBatchProcessAction::class)->name('v2.batch.destroy');
    });

});

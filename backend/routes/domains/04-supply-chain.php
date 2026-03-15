<?php

use App\Http\Controllers\Api\V2\SupplyChain\Inventory\ProductsController;
use App\Http\Controllers\Api\V2\SupplyChain\Inventory\CategoriesController;
use App\Http\Controllers\Api\V2\SupplyChain\Inventory\PeriodicInventoryController;
use App\Http\Controllers\Api\V2\SupplyChain\Inventory\BatchController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Domain Routes: 04-SupplyChain
|--------------------------------------------------------------------------
| Covers: Inventory, Products, Categories, Batch Processing
|--------------------------------------------------------------------------
*/


// ── Inventory Management
Route::group(['prefix' => 'inventory', 'middleware' => 'can:products,view'], function () {
    
    // Products
    Route::group(['prefix' => 'products'], function () {
        Route::get('/', [ProductsController::class, 'index'])->name('v2.inventory.products.index');
        Route::middleware(['can:products,create', 'throttle:api-write'])->post('/', [ProductsController::class, 'store'])->name('v2.inventory.products.store');
        Route::middleware(['can:products,edit', 'throttle:api-write'])->put('/', [ProductsController::class, 'update'])->name('v2.inventory.products.update');
        Route::middleware(['can:products,delete', 'throttle:api-delete'])->delete('/', [ProductsController::class, 'destroy'])->name('v2.inventory.products.destroy');
    });

    // Categories
    Route::group(['prefix' => 'categories'], function () {
        Route::get('/', [CategoriesController::class, 'index'])->name('v2.inventory.categories.index');
        Route::middleware(['can:products,create', 'throttle:api-write'])->post('/', [CategoriesController::class, 'store'])->name('v2.inventory.categories.store');
        Route::middleware(['can:products,edit', 'throttle:api-write'])->put('/', [CategoriesController::class, 'update'])->name('v2.inventory.categories.update');
        Route::middleware(['can:products,delete', 'throttle:api-delete'])->delete('/', [CategoriesController::class, 'destroy'])->name('v2.inventory.categories.destroy');
    });

    // Periodic Inventory
    Route::group(['prefix' => 'periodic'], function () {
        Route::get('/', [PeriodicInventoryController::class, 'index'])->name('v2.inventory.periodic.index');
        Route::get('/valuation', [PeriodicInventoryController::class, 'valuation'])->name('v2.inventory.periodic.valuation');
        Route::middleware(['can:products,create', 'throttle:api-write'])->post('/', [PeriodicInventoryController::class, 'store'])->name('v2.inventory.periodic.store');
        Route::middleware(['can:products,edit', 'throttle:api-critical'])->post('/process', [PeriodicInventoryController::class, 'process'])->name('v2.inventory.periodic.process');
    });

});

// ── Batch Processing
Route::group(['prefix' => 'batch', 'middleware' => 'can:batch_processing,view'], function () {
    Route::get('/', [BatchController::class, 'index'])->name('v2.batch.index');
    Route::middleware(['can:batch_processing,create', 'throttle:api-critical'])->post('/', [BatchController::class, 'store'])->name('v2.batch.store');
    Route::middleware(['can:batch_processing,delete', 'throttle:api-delete'])->delete('/', [BatchController::class, 'destroy'])->name('v2.batch.destroy');
});

<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Commercial\Sales\Actions\{ SubmitZatcaInvoiceAction, GetZatcaStatusAction
};

use App\Http\Controllers\Api\V2\Commercial\AccountsPayable\{ApController, ApTransactionsController};
use App\Http\Controllers\Api\V2\Commercial\AccountsReceivable\{ArController, ArTransactionsController};
use App\Http\Controllers\Api\V2\Commercial\Purchases\PurchasesController;
use App\Http\Controllers\Api\V2\Commercial\Sales\{SalesController, SalesReturnController};
use App\Http\Controllers\Api\V2\Commercial\SalesRepresentatives\SalesRepresentativeController;

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| Domain Routes: 02-Commercial
|--------------------------------------------------------------------------
*/

Route::group(['prefix' => 'v2', 'middleware' => ['api.auth', 'throttle:api']], function () {
    Route::middleware(['can:ap_suppliers,create', 'throttle:api-sensitive'])->post('/ap/payment', [ApTransactionsController::class, 'recordPayment'])->name('v2.ap.payments.store');
});

/*
|--------------------------------------------------------------------------
| Domain Routes: 02-Commercial (Sales, AR, Representatives & ZATCA)
|--------------------------------------------------------------------------
*/

Route::group(['prefix' => 'v2', 'middleware' => ['api.auth', 'throttle:api']], function () {

    // ── Purchase Lifecycle
    Route::group(['prefix' => 'purchases', 'middleware' => 'can:purchases,view'], function () {
        Route::get('/', [PurchasesController::class, 'index'])->name('v2.purchases.index');
        Route::get('/show', [PurchasesController::class, 'show'])->name('v2.purchases.show');
        Route::get('/returns/ledger', [PurchasesController::class, 'returnsLedger'])->name('v2.purchases.returns.ledger');
        
        Route::middleware(['can:purchases,create', 'throttle:api-write'])->post('/', [PurchasesController::class, 'store'])->name('v2.purchases.store');
        Route::middleware(['can:purchases,edit', 'throttle:api-sensitive'])->post('/approve', [PurchasesController::class, 'approve'])->name('v2.purchases.approve');
        Route::middleware(['can:purchases,delete', 'throttle:api-delete'])->delete('/', [PurchasesController::class, 'destroy'])->name('v2.purchases.destroy');

        Route::group(['prefix' => 'requests'], function () {
            Route::get('/', [PurchasesController::class, 'requests'])->name('v2.requests.index');
            Route::post('/', [PurchasesController::class, 'storeRequest'])->name('v2.requests.store');
            Route::post('/auto-generate', [PurchasesController::class, 'autoGenerateRequests'])->name('v2.requests.auto_generate');
            Route::put('/', [PurchasesController::class, 'updateRequest'])->name('v2.requests.update');
        });
    });

    // ── Accounts Payable (Suppliers)
    Route::group(['prefix' => 'ap', 'middleware' => 'can:ap_suppliers,view'], function () {
        Route::get('/suppliers', [ApController::class, 'suppliers'])->name('v2.ap.suppliers');
        Route::get('/ledger', [ApController::class, 'supplierLedger'])->name('v2.ap.ledger');
        Route::get('/transactions', [ApTransactionsController::class, 'index'])->name('v2.ap.transactions');
        
        Route::middleware(['can:ap_suppliers,create', 'throttle:api-write'])->post('/suppliers', [ApController::class, 'storeSupplier'])->name('v2.ap.suppliers.store');
        Route::middleware(['can:ap_suppliers,edit', 'throttle:api-write'])->put('/suppliers', [ApController::class, 'updateSupplier'])->name('v2.ap.suppliers.update');
        Route::middleware(['can:ap_suppliers,delete', 'throttle:api-delete'])->delete('/suppliers', [ApController::class, 'destroySupplier'])->name('v2.ap.suppliers.destroy');

        Route::middleware(['can:ap_suppliers,create', 'throttle:api-write'])->post('/transactions', [ApTransactionsController::class, 'store'])->name('v2.ap.transactions.store');
        Route::middleware(['can:ap_suppliers,edit', 'throttle:api-write'])->put('/transactions', [ApTransactionsController::class, 'update'])->name('v2.ap.transactions.update');
        Route::middleware(['can:ap_suppliers,delete', 'throttle:api-delete'])->delete('/transactions/{id}', [ApTransactionsController::class, 'destroy'])->name('v2.ap.transactions.destroy');
    });

    // ── Sales Representatives
    Route::group(['prefix' => 'commercial/representatives'], function () {
        Route::middleware('can:sales,view')->group(function () {
            Route::get('/', [SalesRepresentativeController::class, 'representatives'])->name('v2.sales_representatives.index');
            Route::get('/ledger', [SalesRepresentativeController::class, 'ledger'])->name('v2.sales_representatives.ledger');
        });
        Route::middleware(['can:sales,create', 'throttle:api-write'])->post('/', [SalesRepresentativeController::class, 'storeRepresentative'])->name('v2.sales_representatives.store');
        Route::middleware(['can:sales,edit', 'throttle:api-write'])->put('/', [SalesRepresentativeController::class, 'updateRepresentative'])->name('v2.sales_representatives.update');
        Route::middleware(['can:sales,delete', 'throttle:api-delete'])->delete('/', [SalesRepresentativeController::class, 'destroyRepresentative'])->name('v2.sales_representatives.destroy');
        Route::middleware(['can:sales,edit', 'throttle:api-write'])->post('/transactions', [SalesRepresentativeController::class, 'storeTransaction'])->name('v2.sales_representatives.transaction.store');
        Route::middleware(['can:sales,delete', 'throttle:api-delete'])->delete('/transactions', [SalesRepresentativeController::class, 'destroyTransaction'])->name('v2.sales_representatives.transaction.destroy');
    });
});



/*
|--------------------------------------------------------------------------
| Domain Routes: 02-Commercial
|--------------------------------------------------------------------------
| Covers: Sales, Purchases, CRM, AR, AP, Marketing
|--------------------------------------------------------------------------
*/

Route::group(['prefix' => 'v2', 'middleware' => ['api.auth', 'throttle:api']], function () {

    // ── Sales Lifecycle
    Route::group(['prefix' => 'sales', 'middleware' => 'can:sales,view'], function () {
        Route::get('/invoices', [SalesController::class, 'index'])->name('v2.invoices.index');
        Route::get('/invoices/show', [SalesController::class, 'show'])->name('v2.invoices.show');
        
        Route::middleware(['can:sales,create', 'throttle:api-write'])->post('/invoices', [SalesController::class, 'store'])->name('v2.invoices.store');
        Route::middleware(['can:sales,delete', 'throttle:api-delete'])->delete('/invoices', [SalesController::class, 'destroy'])->name('v2.invoices.destroy');

        Route::get('/returns', [SalesReturnController::class, 'index'])->name('v2.sales_returns.index');
        Route::get('/returns/show', [SalesReturnController::class, 'show'])->name('v2.sales_returns.show');
        Route::get('/returns/ledger', [SalesReturnController::class, 'ledger'])->name('v2.sales_returns.ledger');
        
        Route::middleware(['can:sales,create', 'throttle:api-write'])->post('/returns', [SalesReturnController::class, 'store'])->name('v2.sales_returns.store');

        // ZATCA
        Route::group(['prefix' => 'zatca'], function() {
            Route::middleware(['can:sales,edit', 'throttle:api-sensitive'])->post('/{id}/submit', function (Request $request, $id) {
                return app()->make(SubmitZatcaInvoiceAction::class, ['request' => $request, 'zatcaService' => app(\App\Domains\Finance\Taxation\Services\ZATCAService::class), 'invoiceId' => (int)$id])();
            })->name('v2.zatca.submit');
            Route::get('/{id}/status', function ($id) {
                return app()->make(GetZatcaStatusAction::class, ['invoiceId' => (int)$id])();
            })->name('v2.zatca.status');
        });
    });

    // ── CRM & Accounts Receivable (Customers)
    Route::group(['prefix' => 'crm', 'middleware' => 'can:ar_customers,view'], function () {
        Route::get('/customers', [ArController::class, 'customers'])->name('v2.crm.customers.index');
        Route::get('/ledger', [ArController::class, 'ledger'])->name('v2.crm.ledger');
        
        Route::middleware(['can:ar_customers,create', 'throttle:api-write'])->post('/customers', [ArController::class, 'storeCustomer'])->name('v2.crm.customers.store');
        Route::middleware(['can:ar_customers,edit', 'throttle:api-write'])->put('/customers', [ArController::class, 'updateCustomer'])->name('v2.crm.customers.update');
        Route::middleware(['can:ar_customers,delete', 'throttle:api-delete'])->delete('/customers', [ArController::class, 'destroyCustomer'])->name('v2.crm.customers.destroy');

        Route::get('/transactions', [ArTransactionsController::class, 'index'])->name('v2.ar.transactions.index');
        Route::middleware(['can:ar_customers,create', 'throttle:api-write'])->post('/transactions', [ArTransactionsController::class, 'store'])->name('v2.ar.transactions.store');
        Route::middleware(['can:ar_customers,delete', 'throttle:api-delete'])->delete('/transactions/{id}', [ArTransactionsController::class, 'destroy'])->name('v2.ar.transactions.destroy');
    });

});

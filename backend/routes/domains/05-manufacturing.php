<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Domain Routes: 05-Manufacturing
|--------------------------------------------------------------------------
*/

Route::group(['prefix' => 'v2', 'middleware' => ['api.auth', 'throttle:api']], function () {

    Route::group(['prefix' => 'manufacturing', 'middleware' => 'can:settings,view'], function () {
        // Placeholder for future Actions: BomListAction, WorkOrderAction, etc.
    });

});

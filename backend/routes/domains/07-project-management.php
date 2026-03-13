<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Domain Routes: 07-ProjectManagement
|--------------------------------------------------------------------------
*/

Route::group(['prefix' => 'v2', 'middleware' => ['api.auth', 'throttle:api']], function () {

    Route::group(['prefix' => 'projects', 'middleware' => 'can:sales,view'], function () {
        // Placeholder for future Actions: ListProjectsAction, etc.
    });

});

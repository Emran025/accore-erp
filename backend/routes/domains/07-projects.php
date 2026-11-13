<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Domain Routes: 07-ProjectManagement
|--------------------------------------------------------------------------
*/


Route::group(['prefix' => 'projects', 'middleware' => ['can:sales,view', 'module.operational:projects']], function () {
    // Placeholder for future Actions: ListProjectsAction, etc.
});


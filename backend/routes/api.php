<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes v2 
|--------------------------------------------------------------------------
*/

Route::group(['prefix' => 'v2'], function () {
    require __DIR__ . '/domains/00-auth.php';
    require __DIR__ . '/domains/10-platform.php';

    Route::group([ 'middleware' => ['api.auth', 'throttle:api']], function () {
        /*
        |--------------------------------------------------------------------------
        | Domain Routes (Strangler Fig – v2)
        |--------------------------------------------------------------------------
        | New domain-scoped routes using Single Action Classes. These coexist
        | with the legacy routes above. Once fully tested, legacy routes will
        | be retired incrementally.
        */
        require __DIR__ . '/domains/01-enterprise-core.php';
        require __DIR__ . '/domains/02-commercial.php';
        require __DIR__ . '/domains/03-finance.php';
        require __DIR__ . '/domains/04-supply-chain.php';
        require __DIR__ . '/domains/05-manufacturing.php';
        require __DIR__ . '/domains/06-human-capital.php';
        require __DIR__ . '/domains/07-projects.php';
        require __DIR__ . '/domains/08-assets.php';
        require __DIR__ . '/domains/09-intelligence.php';

    });
});
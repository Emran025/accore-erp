<?php

use App\Http\Controllers\Api\V2\EnterpriseCore\IdentityAccess\AuthController;
use Illuminate\Support\Facades\Route;

// ── Authentication (IdentityAccess)
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:api-auth')
    ->name('v2.login');

Route::post('/refresh', [AuthController::class, 'refresh'])
    ->middleware('throttle:api-auth')
    ->name('v2.refresh');

Route::post('/revoke', [AuthController::class, 'revoke'])
    ->middleware('throttle:api-auth')
    ->name('v2.revoke');

Route::group(['middleware' => 'api.auth'], function () {
    Route::post('/logout', [AuthController::class, 'logout'])
        ->name('v2.logout');
    Route::get('/check', [AuthController::class, 'check'])
        ->name('v2.check');
});

<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V2\EnterpriseCore\IdentityAccess\AuthController;

// ── Authentication (IdentityAccess)
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:api-auth')
    ->name('v2.login');

Route::group(['middleware' => 'api.auth'], function () {
    Route::post('/logout', [AuthController::class, 'logout'])
        ->name('v2.logout');
    Route::get('/check', [AuthController::class, 'check'])
        ->name('v2.check');
});
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisterController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Auth menggunakan Laravel Sanctum SPA cookie-based.
| Frontend wajib memanggil GET /sanctum/csrf-cookie sebelum POST /api/login,
| POST /api/register, dan POST /api/logout.
|
*/

// ==================== AUTH PUBLIC ====================
Route::post('/register', [RegisterController::class, 'register'])
    ->middleware('guest');

Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('guest')
    ->name('login');

// ==================== AUTH PROTECTED ====================
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user()->only([
            'id',
            'name',
            'email',
            'nim',
            'class_',
            'role',
        ]);
    });

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});

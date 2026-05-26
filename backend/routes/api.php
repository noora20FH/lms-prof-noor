<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Http\Controllers\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisterController;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use App\Http\Middleware\VerifyCsrfToken;

// ==================== REGISTER (SP A Stateful) ====================
Route::middleware([
    'web',                                      // penting
    EnsureFrontendRequestsAreStateful::class,   // ini yang memperbaiki CSRF
    VerifyCsrfToken::class,                     // ini yang memperbaiki CSRF
])->group(function () {
    Route::post('/register', [RegisterController::class, 'register']);
});

])->group(function () {
    Route::post('/register', [RegisterController::class, 'register']);
});

// ==================== LOGIN & LOGOUT (sudah dari Fortify) ====================
Route::post('/login', [AuthenticatedSessionController::class, 'store'])
     ->name('login');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
         ->name('logout');
});

<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Professor\MaterialController;

// ==================== AUTH PUBLIC ====================
Route::post('/register', [RegisterController::class, 'register']);

Route::post('/login', [AuthenticatedSessionController::class, 'store'])
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

    Route::prefix('professor')->group(function () {
        Route::get('/courses', [MaterialController::class, 'courses']);

        Route::get('/materials', [MaterialController::class, 'index']);
        Route::post('/materials', [MaterialController::class, 'store']);
        Route::post('/materials/{material}', [MaterialController::class, 'update']);
        Route::put('/materials/{material}', [MaterialController::class, 'update']);
        Route::patch('/materials/{material}', [MaterialController::class, 'update']);
        Route::delete('/materials/{material}', [MaterialController::class, 'destroy']);
    });
});

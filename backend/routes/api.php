<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisterController;

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
});

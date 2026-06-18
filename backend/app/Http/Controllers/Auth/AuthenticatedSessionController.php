<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthenticatedSessionController extends Controller
{
    /**
     * Login untuk Sanctum SPA cookie-based.
     *
     * Tidak membuat personal access token.
     * Laravel akan menyimpan status login pada session cookie.
     */
    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password yang Anda masukkan salah.'],
            ]);
        }

        $request->session()->regenerate();

        $user = $request->user();

        return response()->json([
            'message' => 'Login berhasil.',
            'user' => $user->only([
                'id',
                'name',
                'email',
                'nim',
                'class_',
                'role',
            ]),
        ], 200);
    }

    /**
     * Logout untuk Sanctum SPA cookie-based.
     *
     * Tidak memakai currentAccessToken(), karena login tidak memakai Bearer token.
     */
    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Berhasil logout.',
        ], 200);
    }
}

<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class RegisterController extends Controller
{
    /**
     * Register untuk Sanctum SPA cookie-based.
     *
     * Endpoint ini tidak membuat token.
     * Setelah register berhasil, frontend dapat mengarahkan user ke halaman login.
     */
    public function register(Request $request)
    {
        // Kompatibel dengan frontend yang mengirim "class" atau "class_".
        if ($request->filled('class') && ! $request->filled('class_')) {
            $request->merge([
                'class_' => $request->input('class'),
            ]);
        }

        $validator = Validator::make($request->all(), [
            'name'                  => ['required', 'string', 'max:255'],
            'nim'                   => ['required', 'string', 'max:50', 'unique:users,nim'],
            'class_'                => ['required', 'string', 'max:50'],
            'email'                 => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
            'role'                  => ['nullable', 'in:student'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name'     => $request->input('name'),
            'nim'      => $request->input('nim'),
            'class_'   => $request->input('class_'),
            'email'    => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'role'     => 'student',
        ]);

        return response()->json([
            'message' => 'Registrasi berhasil. Silakan login.',
            'user'    => $user->only([
                'id',
                'name',
                'nim',
                'class_',
                'email',
                'role',
            ]),
        ], 201);
    }
}

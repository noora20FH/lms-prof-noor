<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdatePasswordRequest;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'profile' => $this->profilePayload(
                $request->user()->loadMissing('profile')
            ),
        ]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        DB::transaction(function () use ($user, $validated): void {
            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'nim' => $user->role === 'student'
                    ? ($validated['nim'] ?? null)
                    : $user->nim,
                'class_' => $user->role === 'student'
                    ? ($validated['class_'] ?? null)
                    : $user->class_,
            ]);

            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'department' => $validated['department'] ?? null,
                    'study_program' => $validated['study_program'] ?? null,
                ]
            );
        });

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'profile' => $this->profilePayload($user->fresh('profile')),
        ]);
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $request->user()->forceFill([
            'password' => Hash::make($validated['password']),
        ])->save();

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return response()->json([
            'message' => 'Password berhasil diperbarui.',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function profilePayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'nim' => $user->nim,
            'class_' => $user->class_,
            'role' => $user->role,
            'department' => $user->profile?->department,
            'study_program' => $user->profile?->study_program,
        ];
    }
}

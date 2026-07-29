<?php

namespace Tests\Feature\Profile;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_read_profile(): void
    {
        $user = User::factory()->create([
            'nim' => '20260001',
            'class_' => 'TL-1A',
            'role' => 'student',
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/profile')
            ->assertOk()
            ->assertJsonPath('profile.id', $user->id)
            ->assertJsonPath('profile.nim', '20260001')
            ->assertJsonPath('profile.role', 'student');
    }

    public function test_student_can_update_profile(): void
    {
        $user = User::factory()->create([
            'nim' => '20260001',
            'class_' => 'TL-1A',
            'role' => 'student',
        ]);

        Sanctum::actingAs($user);

        $this->patchJson('/api/profile', [
            'name' => 'Aulia Rahma',
            'email' => 'aulia@example.com',
            'nim' => '20260002',
            'class_' => 'TL-1B',
            'department' => 'Electrical Engineering',
            'study_program' => 'Electrical Engineering Technology',
        ])
            ->assertOk()
            ->assertJsonPath('profile.name', 'Aulia Rahma')
            ->assertJsonPath('profile.department', 'Electrical Engineering');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email' => 'aulia@example.com',
            'nim' => '20260002',
            'class_' => 'TL-1B',
        ]);

        $this->assertDatabaseHas('profiles', [
            'user_id' => $user->id,
            'department' => 'Electrical Engineering',
        ]);
    }

    public function test_user_can_change_password_with_current_password(): void
    {
        $user = User::factory()->create([
            'nim' => '20260001',
            'class_' => 'TL-1A',
            'role' => 'student',
            'password' => Hash::make('old-password'),
        ]);

        Sanctum::actingAs($user);

        $this->putJson('/api/profile/password', [
            'current_password' => 'old-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertOk();

        $this->assertTrue(Hash::check('new-password', $user->fresh()->password));
    }

    public function test_wrong_current_password_is_rejected(): void
    {
        $user = User::factory()->create([
            'nim' => '20260001',
            'class_' => 'TL-1A',
            'role' => 'student',
            'password' => Hash::make('old-password'),
        ]);

        Sanctum::actingAs($user);

        $this->putJson('/api/profile/password', [
            'current_password' => 'wrong-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertUnprocessable();
    }
}

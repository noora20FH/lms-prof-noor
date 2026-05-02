<?php

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ====================== PROFESSOR ======================
        $professor = User::create([
            'name'     => 'Prof. Noor',
            'email'    => 'profnoor@gmail.com',
            'password' => Hash::make('password123'),
            'role'     => 'professor',
        ]);

        // ====================== STUDENT ======================
        $student = User::create([
            'name'     => 'Noora Putri',
            'email'    => 'noora@gmail.com',           // ← email yang kamu coba di login
            'password' => Hash::make('password123'),
            'role'     => 'student',
        ]);

        // Buat Profile untuk Student (wajib)
        Profile::create([
            'user_id'       => $student->id,
            'nim'           => '230101045',
            'photo'         => null,
            'class'         => '3A',
            'department'    => 'Teknik Informatika',
            'study_program' => 'S1 Informatika',
        ]);

        $this->command->info('✅ UserSeeder selesai!');
        $this->command->info('👨‍🏫 Professor → profnoor@gmail.com / password123');
        $this->command->info('👩‍🎓 Student   → noora@gmail.com / password123');
    }
}

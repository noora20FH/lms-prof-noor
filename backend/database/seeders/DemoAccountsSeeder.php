<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoAccountsSeeder extends Seeder
{
    public function run(): void
    {
        // Professor
        User::updateOrCreate(
            ['email' => 'professor@demo.com'],
            [
                'name'     => 'Prof. M. Noor Hidayat',
                'password' => Hash::make('password'),
                'role'     => 'professor',
            ]
        );

        // Student
        User::updateOrCreate(
            ['email' => 'student@demo.com'],
            [
                'name'     => 'Ahmad Fauzi (Student)',
                'password' => Hash::make('password'),
                'role'     => 'student',
            ]
        );

        $this->command->info('✅ Demo accounts created: professor@demo.com & student@demo.com (password: password)');
    }
}

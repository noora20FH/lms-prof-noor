<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class EducationalDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function (): void {
            $professorId = $this->getOrCreateProfessorId();

            $courseId1 = $this->upsertCourse([
                'professor_id' => $professorId,
                'title' => 'Pemrograman Web Lanjut',
                'code' => 'IF-301',
                'description' => 'Mata kuliah pengembangan aplikasi web modern menggunakan ekosistem Laravel dan frontend framework.',
                'status' => 'active',
                'capacity' => 50,
                'total_weeks' => 17,
            ]);

            $courseId2 = $this->upsertCourse([
                'professor_id' => $professorId,
                'title' => 'Sistem Terdistribusi',
                'code' => 'IF-302',
                'description' => 'Fokus pada arsitektur, konsistensi data, dan pengelolaan computing cluster.',
                'status' => 'active',
                'capacity' => 40,
                'total_weeks' => 17,
            ]);

            for ($weekNumber = 1; $weekNumber <= 17; $weekNumber++) {
                $weekId = $this->upsertWeek(
                    $courseId1,
                    $weekNumber,
                    "Pertemuan Minggu ke-{$weekNumber}"
                );

                $this->upsertMaterial($weekId, [
                    'title' => "Slide Materi Kuliah - Minggu {$weekNumber}",
                    'type' => 'ppt',
                    'content_url' => "https://example.com/materials/slide-minggu-{$weekNumber}.pptx",
                ]);

                $this->upsertMaterial($weekId, [
                    'title' => "Video Referensi Pembelajaran {$weekNumber}",
                    'type' => 'yt_link',
                    'content_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                ]);
            }

            for ($weekNumber = 1; $weekNumber <= 17; $weekNumber++) {
                $this->upsertWeek(
                    $courseId2,
                    $weekNumber,
                    "Introduction to Distributed Systems - Part {$weekNumber}"
                );
            }
        });
    }

    private function getOrCreateProfessorId(): int
    {
        $email = 'professor@example.com';

        $existingProfessor = DB::table('users')->where('email', $email)->first();

        if ($existingProfessor) {
            DB::table('users')
                ->where('id', $existingProfessor->id)
                ->update($this->withExistingColumns('users', [
                    'name' => 'Prof. Noor',
                    'role' => 'professor',
                    'updated_at' => now(),
                ]));

            return (int) $existingProfessor->id;
        }

        return (int) DB::table('users')->insertGetId($this->withExistingColumns('users', [
            'name' => 'Prof. Noor',
            'email' => $email,
            'nim' => 'PROF001',
            'class_' => null,
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'professor',
            'created_at' => now(),
            'updated_at' => now(),
        ]));
    }

    private function upsertCourse(array $data): int
    {
        $lookup = Schema::hasColumn('courses', 'code') && ! empty($data['code'])
            ? ['code' => $data['code']]
            : ['title' => $data['title'], 'professor_id' => $data['professor_id']];

        $courseData = $this->withExistingColumns('courses', array_merge($data, [
            'created_at' => now(),
            'updated_at' => now(),
        ]));

        $updateData = $courseData;
        unset($updateData['created_at']);

        DB::table('courses')->updateOrInsert($lookup, $updateData);

        $query = DB::table('courses');

        foreach ($lookup as $column => $value) {
            $query->where($column, $value);
        }

        return (int) $query->value('id');
    }

    private function upsertWeek(int $courseId, int $weekNumber, string $title): int
    {
        DB::table('weeks')->updateOrInsert(
            [
                'course_id' => $courseId,
                'week_number' => $weekNumber,
            ],
            $this->withExistingColumns('weeks', [
                'title' => $title,
                'updated_at' => now(),
                'created_at' => now(),
            ])
        );

        return (int) DB::table('weeks')
            ->where('course_id', $courseId)
            ->where('week_number', $weekNumber)
            ->value('id');
    }

    private function upsertMaterial(int $weekId, array $data): void
    {
        DB::table('materials')->updateOrInsert(
            [
                'week_id' => $weekId,
                'title' => $data['title'],
            ],
            $this->withExistingColumns('materials', array_merge($data, [
                'week_id' => $weekId,
                'created_at' => now(),
                'updated_at' => now(),
            ]))
        );
    }

    private function withExistingColumns(string $table, array $data): array
    {
        return collect($data)
            ->filter(fn ($value, string $column): bool => Schema::hasColumn($table, $column))
            ->all();
    }
}

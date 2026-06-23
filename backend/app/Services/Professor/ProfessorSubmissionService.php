<?php

namespace App\Services\Professor;

use App\Models\Course;
use App\Models\Submission;
use App\Models\User;
use App\Models\Week;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ProfessorSubmissionService
{
    public function getWeekSubmissions(User $professor, Course $course, int $weekNumber): Collection
    {
        $this->ensureProfessor($professor);
        $this->ensureCourseOwner($course, $professor->id);

        $week = $this->resolveWeek($course, $weekNumber);

        return Submission::query()
            ->with(['student', 'assignment.week.course'])
            ->whereHas('assignment', function ($query) use ($week) {
                $query->where('week_id', $week->id);
            })
            ->orderByDesc('submitted_at')
            ->orderByDesc('id')
            ->get();
    }

    public function gradeSubmission(Submission $submission, User $professor, array $validated): Submission
    {
        $this->ensureProfessor($professor);

        $submission->loadMissing(['assignment.week.course', 'student']);
        $this->ensureCourseOwner($submission->assignment->week->course, $professor->id);

        return DB::transaction(function () use ($submission, $professor, $validated) {
            $submission->update([
                'score' => $validated['score'],
                'feedback' => $validated['feedback'] ?? null,
                'graded_at' => now(),
                'graded_by' => $professor->id,
                'status' => 'graded',
            ]);

            return $submission->fresh(['student', 'assignment.week.course']);
        });
    }

    private function ensureProfessor(User $user): void
    {
        if ($user->role !== 'professor') {
            abort(403, 'Akses hanya untuk professor.');
        }
    }

    private function ensureCourseOwner(Course $course, int $professorId): void
    {
        if ((int) $course->professor_id !== $professorId) {
            abort(403, 'Anda tidak memiliki akses ke mata kuliah ini.');
        }
    }

    private function resolveWeek(Course $course, int $weekNumber): Week
    {
        return Week::firstOrCreate(
            [
                'course_id' => $course->id,
                'week_number' => $weekNumber,
            ],
            [
                'title' => 'Week ' . $weekNumber,
            ]
        );
    }
}

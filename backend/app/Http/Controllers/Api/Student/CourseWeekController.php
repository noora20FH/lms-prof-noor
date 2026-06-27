<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class CourseWeekController extends Controller
{
    public function index(Request $request, Course $course): JsonResponse
    {
        $user = $request->user();

        abort_unless($user && $user->role === 'student', 403, 'Akses hanya untuk mahasiswa.');

        $this->ensureStudentIsEnrolled($course, (int) $user->id);

        $weeks = $course->weeks()
            ->withCount(['materials', 'assignments'])
            ->orderBy('week_number')
            ->get()
            ->map(function ($week) {
                $unlockAt = $week->unlock_at
                    ? Carbon::parse($week->unlock_at)
                    : null;

                $isAccessible = $unlockAt !== null && $unlockAt->lte(now());

                return [
                    'id' => (int) $week->id,
                    'week_number' => (int) $week->week_number,
                    'title' => $week->title ?: 'Week ' . $week->week_number,
                    'unlock_at' => $unlockAt?->toISOString(),
                    'due_at' => $week->due_at
                        ? Carbon::parse($week->due_at)->toISOString()
                        : null,
                    'materials_count' => (int) $week->materials_count,
                    'assignments_count' => (int) $week->assignments_count,
                    'is_accessible' => $isAccessible,
                    'is_locked' => ! $isAccessible,
                ];
            })
            ->values();

        return response()->json([
            'course' => [
                'id' => (int) $course->id,
                'title' => $course->title,
                'description' => $course->description,
            ],
            'data' => $weeks,
        ]);
    }

    public function show(Request $request, Course $course, int $week): JsonResponse
    {
        $user = $request->user();

        abort_unless($user && $user->role === 'student', 403, 'Akses hanya untuk mahasiswa.');

        $this->ensureStudentIsEnrolled($course, (int) $user->id);

        $courseWeek = $course->weeks()
            ->where('week_number', $week)
            ->firstOrFail();

        $unlockAt = $courseWeek->unlock_at
            ? Carbon::parse($courseWeek->unlock_at)
            : null;

        abort_if(
            $unlockAt === null || $unlockAt->isFuture(),
            403,
            'Week ini belum dapat diakses.'
        );

        $courseWeek->load([
            'materials:id,week_id,title,type,content_url',
            'assignments' => function ($query) use ($user) {
                $query
                    ->orderBy('end_date')
                    ->with([
                        'submissions' => function ($submissionQuery) use ($user) {
                            $submissionQuery
                                ->where('student_id', $user->id)
                                ->latest('submitted_at');
                        },
                    ]);
            },
        ]);

        return response()->json([
            'data' => [
                'course' => [
                    'id' => (int) $course->id,
                    'title' => $course->title,
                    'description' => $course->description,
                ],
                'week' => [
                    'id' => (int) $courseWeek->id,
                    'week_number' => (int) $courseWeek->week_number,
                    'title' => $courseWeek->title,
                    'unlock_at' => $unlockAt->toISOString(),
                    'due_at' => $courseWeek->due_at
                        ? Carbon::parse($courseWeek->due_at)->toISOString()
                        : null,
                ],
                'materials' => $courseWeek->materials->map(fn ($material) => [
                    'id' => (int) $material->id,
                    'title' => $material->title,
                    'type' => $material->type,
                    'access_url' => route('student.materials.open', ['material' => $material->id]),
                ])->values(),
                'assignments' => $courseWeek->assignments->map(function ($assignment) {
                    $submission = $assignment->submissions->first();

                    return [
                        'id' => (int) $assignment->id,
                        'title' => $assignment->title,
                        'description' => $assignment->description,
                        'start_date' => $assignment->start_date?->toISOString(),
                        'end_date' => $assignment->end_date?->toISOString(),
                        'file_url' => $assignment->file_url,
                        'gdrive_submission_link' => $assignment->gdrive_submission_link,
                        'submission_note' => $assignment->submission_note,
                        'my_submission' => $submission ? [
                            'id' => (int) $submission->id,
                            'file_url' => $submission->file_url,
                            'link_url' => $submission->link_url,
                            'submitted_at' => $submission->submitted_at?->toISOString(),
                            'score' => $submission->score,
                            'feedback' => $submission->feedback,
                            'status' => $submission->status,
                        ] : null,
                    ];
                })->values(),
            ],
        ]);
    }

    private function ensureStudentIsEnrolled(Course $course, int $studentId): void
    {
        $isEnrolled = $course->enrollments()
            ->where('student_id', $studentId)
            ->where('status', 'approved')
            ->exists();

        abort_unless($isEnrolled, 403, 'Anda tidak terdaftar pada mata kuliah ini.');
    }
}

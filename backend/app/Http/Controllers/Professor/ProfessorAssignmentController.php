<?php

namespace App\Http\Controllers\Professor;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Course;
use App\Models\Week;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProfessorAssignmentController extends Controller
{
    public function week(Request $request, Course $course, int $week)
    {
        $this->ensureProfessor($request);
        $this->ensureCourseOwner($course, $request->user()->id);

        $weekModel = $this->resolveWeek($course, $week);

        $assignments = Assignment::query()
            ->where('week_id', $weekModel->id)
            ->withCount('submissions')
            ->orderBy('end_date')
            ->orderBy('id')
            ->get()
            ->map(fn (Assignment $assignment) => $this->assignmentResponse($assignment, $course, $weekModel));

        return response()->json([
            'course' => [
                'id' => (string) $course->id,
                'title' => $course->title,
                'description' => $course->description ?? '',
                'status' => $course->status ?? 'active',
                'capacity' => (int) ($course->capacity ?? 50),
                'total_students' => (int) ($course->capacity ?? 50),
                'total_weeks' => (int) ($course->total_weeks ?? 17),
            ],
            'week' => [
                'id' => $weekModel->id,
                'week_number' => $weekModel->week_number,
                'title' => $weekModel->title ?: 'Minggu ' . $weekModel->week_number,
            ],
            'assignments' => $assignments,
        ]);
    }

    public function indexByWeek(Request $request, Course $course, int $week)
    {
        return $this->week($request, $course, $week);
    }

    public function store(Request $request, Course $course, int $week)
    {
        $this->ensureProfessor($request);
        $this->ensureCourseOwner($course, $request->user()->id);

        $weekModel = $this->resolveWeek($course, $week);
        $validated = $this->validateAssignment($request);

        $assignment = Assignment::create([
            'week_id' => $weekModel->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'file_url' => $validated['file_url'] ?? null,
            'gdrive_submission_link' => $validated['gdrive_submission_link'] ?? null,
            'submission_note' => $validated['submission_note'] ?? null,
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'],
        ]);

        $assignment->loadCount('submissions');

        return response()->json([
            'message' => 'Assignment berhasil dibuat.',
            'assignment' => $this->assignmentResponse($assignment, $course, $weekModel),
        ], 201);
    }

    public function update(Request $request, Assignment $assignment)
    {
        $this->ensureProfessor($request);
        $assignment->loadMissing(['week.course']);
        $this->ensureCourseOwner($assignment->week->course, $request->user()->id);

        $validated = $this->validateAssignment($request);

        $assignment->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'file_url' => $validated['file_url'] ?? null,
            'gdrive_submission_link' => $validated['gdrive_submission_link'] ?? null,
            'submission_note' => $validated['submission_note'] ?? null,
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'],
        ]);

        $assignment = $assignment->fresh(['week.course']);
        $assignment->loadCount('submissions');

        return response()->json([
            'message' => 'Assignment berhasil diperbarui.',
            'assignment' => $this->assignmentResponse($assignment, $assignment->week->course, $assignment->week),
        ]);
    }

    public function destroy(Request $request, Assignment $assignment)
    {
        $this->ensureProfessor($request);
        $assignment->loadMissing(['week.course']);
        $this->ensureCourseOwner($assignment->week->course, $request->user()->id);

        $assignment->delete();

        return response()->json([
            'message' => 'Assignment berhasil dihapus.',
        ]);
    }

    private function validateAssignment(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'file_url' => ['nullable', 'url', 'max:500'],
            'gdrive_submission_link' => ['nullable', 'url', 'max:500'],
            'submission_note' => ['nullable', 'string'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['required', 'date'],
        ]);
    }

    private function ensureProfessor(Request $request): void
    {
        if ($request->user()->role !== 'professor') {
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
                'title' => 'Minggu ' . $weekNumber,
            ]
        );
    }

    private function assignmentResponse(Assignment $assignment, Course $course, Week $week): array
    {
        $assignment->loadCount('submissions');

        $dueDate = $assignment->end_date ? $assignment->end_date->toDateString() : null;
        $daysLeft = $assignment->end_date
            ? now()->startOfDay()->diffInDays($assignment->end_date->copy()->startOfDay(), false)
            : 0;

        $status = 'pending';
        if (($assignment->submissions_count ?? 0) > 0) {
            $status = DB::table('submissions')
                ->where('assignment_id', $assignment->id)
                ->where('status', 'graded')
                ->exists()
                    ? 'graded'
                    : 'submitted';
        }

        return [
            'id' => (string) $assignment->id,
            'courseId' => (int) $course->id,
            'course' => $course->title,
            'week' => (int) $week->week_number,
            'title' => $assignment->title,
            'description' => $assignment->description ?? '',
            'startDate' => $assignment->start_date?->toDateString() ?? '',
            'dueDate' => $dueDate ?? '',
            'daysLeft' => (int) $daysLeft,
            'status' => $status,
            'gdriveSubmissionLink' => $assignment->gdrive_submission_link ?? $assignment->file_url ?? '',
            'submissionNote' => $assignment->submission_note ?? '',
            'submissionsCount' => (int) ($assignment->submissions_count ?? 0),
        ];
    }
}

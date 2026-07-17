<?php

namespace App\Http\Controllers\Professor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Week;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class ProfessorCourseController extends Controller
{
    public function index(Request $request)
    {
        $this->ensureProfessor($request);

        $courses = Course::query()
            ->where('professor_id', $request->user()->id)
            ->withCount([
                'enrollments as approved_students_count' => function ($query) {
                    $query->where('status', 'approved');
                },
            ])
            ->orderBy('title')
            ->get()
            ->map(fn (Course $course) => $this->courseResponse($course));

        return response()->json([
            'courses' => $courses,
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureProfessor($request);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('courses', 'code')->whereNotNull('code'),
            ],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:500'],
            'total_students' => ['nullable', 'integer', 'min:1', 'max:500'],
            'total_weeks' => ['nullable', 'integer', 'min:1', 'max:52'],
            'status' => ['nullable', Rule::in(['active', 'disabled'])],
        ]);

        $capacity = $validated['capacity'] ?? $validated['total_students'] ?? 50;
        $totalWeeks = $validated['total_weeks'] ?? 17;

        $course = DB::transaction(function () use ($request, $validated, $capacity, $totalWeeks) {
            $payload = [
                'professor_id' => $request->user()->id,
                'title' => $validated['title'],
                'description' => $validated['description'],
            ];

            if (Schema::hasColumn('courses', 'code')) {
                $payload['code'] = $validated['code'] ?? null;
            }

            if (Schema::hasColumn('courses', 'status')) {
                $payload['status'] = $validated['status'] ?? 'active';
            }

            if (Schema::hasColumn('courses', 'capacity')) {
                $payload['capacity'] = $capacity;
            }

            if (Schema::hasColumn('courses', 'total_weeks')) {
                $payload['total_weeks'] = $totalWeeks;
            }

            $course = Course::create($payload);

            $this->ensureWeeks($course, $totalWeeks);

            return $course;
        });

        $course->loadCount([
            'enrollments as approved_students_count' => fn ($query) => $query->where('status', 'approved'),
        ]);

        return response()->json([
            'message' => 'Mata kuliah berhasil dibuat.',
            'course' => $this->courseResponse($course),
        ], 201);
    }

    public function show(Request $request, Course $course)
    {
        $this->ensureProfessor($request);
        $this->ensureCourseOwner($course, $request->user()->id);

        $course->loadCount([
            'enrollments as approved_students_count' => fn ($query) => $query->where('status', 'approved'),
        ]);

        return response()->json([
            'course' => $this->courseResponse($course),
        ]);
    }

    public function details(Request $request, Course $course)
    {
        $this->ensureProfessor($request);
        $this->ensureCourseOwner($course, $request->user()->id);

        $totalWeeks = (int) ($course->total_weeks ?? 17);
        $this->ensureWeeks($course, $totalWeeks);

        $course->loadCount([
            'enrollments as approved_students_count' => fn ($query) => $query->where('status', 'approved'),
        ]);

        $weeks = Week::query()
            ->where('course_id', $course->id)
            ->withCount(['materials', 'assignments'])
            ->orderBy('week_number')
            ->get()
            ->map(fn (Week $week) => [
                'id' => $week->id,
                'course_id' => $week->course_id,
                'week_number' => $week->week_number,
                'title' => $week->title ?: 'Week ' . $week->week_number,
                'materials_count' => $week->materials_count,
                'assignments_count' => $week->assignments_count,
            ]);

        $assignmentsCount = DB::table('assignments')
            ->join('weeks', 'weeks.id', '=', 'assignments.week_id')
            ->where('weeks.course_id', $course->id)
            ->count();

        return response()->json([
            'course' => $this->courseResponse($course),
            'weeks' => $weeks,
            'stats' => [
                'approved_students_count' => (int) ($course->approved_students_count ?? 0),
                'assignments_count' => $assignmentsCount,
                'total_weeks' => $totalWeeks,
            ],
        ]);
    }

    public function update(Request $request, Course $course)
    {
        $this->ensureProfessor($request);
        $this->ensureCourseOwner($course, $request->user()->id);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('courses', 'code')
                    ->ignore($course->id)
                    ->whereNotNull('code'),
            ],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:500'],
            'total_students' => ['nullable', 'integer', 'min:1', 'max:500'],
            'total_weeks' => ['nullable', 'integer', 'min:1', 'max:52'],
            'status' => ['nullable', Rule::in(['active', 'disabled'])],
        ]);

        $payload = [
            'title' => $validated['title'],
            'description' => $validated['description'],
        ];

        if (Schema::hasColumn('courses', 'code')) {
            $payload['code'] = $validated['code'] ?? $course->code;
        }

        if (Schema::hasColumn('courses', 'status')) {
            $payload['status'] = $validated['status'] ?? $course->status ?? 'active';
        }

        if (Schema::hasColumn('courses', 'capacity')) {
            $payload['capacity'] = $validated['capacity'] ?? $validated['total_students'] ?? $course->capacity ?? 50;
        }

        if (Schema::hasColumn('courses', 'total_weeks')) {
            $payload['total_weeks'] = $validated['total_weeks'] ?? $course->total_weeks ?? 17;
        }

        DB::transaction(function () use ($course, $payload) {
            $course->update($payload);
            $this->ensureWeeks($course->fresh(), (int) ($payload['total_weeks'] ?? 17));
        });

        $course = $course->fresh();
        $course->loadCount([
            'enrollments as approved_students_count' => fn ($query) => $query->where('status', 'approved'),
        ]);

        return response()->json([
            'message' => 'Mata kuliah berhasil diperbarui.',
            'course' => $this->courseResponse($course),
        ]);
    }

    public function destroy(Request $request, Course $course)
    {
        $this->ensureProfessor($request);
        $this->ensureCourseOwner($course, $request->user()->id);

        $deletedCourseId = (string) $course->id;

        DB::transaction(function () use ($course) {
            $course->delete();
        });

        return response()->json([
            'message' => 'Mata kuliah berhasil dihapus.',
            'course_id' => $deletedCourseId,
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

    private function ensureWeeks(Course $course, int $totalWeeks = 17): void
    {
        for ($weekNumber = 1; $weekNumber <= $totalWeeks; $weekNumber++) {
            Week::firstOrCreate(
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

    private function courseResponse(Course $course): array
    {
        return [
            'id' => (string) $course->id,
            'title' => $course->title,
            'code' => $course->code ?? null,
            'description' => $course->description ?? '',
            'status' => $course->status ?? 'active',
            'capacity' => (int) ($course->capacity ?? 50),
            'total_students' => (int) ($course->capacity ?? 50),
            'total_weeks' => (int) ($course->total_weeks ?? 17),
            'approved_students_count' => (int) ($course->approved_students_count ?? 0),
            'created_at' => $course->created_at,
            'updated_at' => $course->updated_at,
        ];
    }
}

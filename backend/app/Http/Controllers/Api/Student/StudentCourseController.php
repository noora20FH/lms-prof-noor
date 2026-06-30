<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseEnrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentCourseController extends Controller
{
    /**
     * Menampilkan seluruh course aktif beserta status enrollment mahasiswa login.
     */
    public function index(Request $request): JsonResponse
    {
        $studentId = $this->studentId($request);

        $courses = Course::query()
            ->where('status', 'active')
            ->with([
                'professor:id,name',
                'enrollments' => function ($query) use ($studentId) {
                    $query
                        ->withTrashed()
                        ->where('student_id', $studentId);
                },
            ])
            ->withCount([
                'enrollments as approved_students_count' => function ($query) {
                    $query->where('status', 'approved');
                },
                'enrollments as enrollment_requests_count',
                'weeks as accessible_weeks_count' => function ($query) {
                    $query
                        ->whereNotNull('unlock_at')
                        ->where('unlock_at', '<=', now());
                },
            ])
            ->orderBy('title')
            ->get()
            ->map(fn (Course $course) => $this->courseResponse($course))
            ->values();

        return response()->json([
            'courses' => $courses,
        ]);
    }

    /**
     * Membuat pengajuan enrollment baru.
     */
    public function store(Request $request, Course $course): JsonResponse
    {
        $studentId = $this->studentId($request);
        $this->ensureCourseIsActive($course);

        $enrollment = DB::transaction(function () use ($course, $studentId) {
            $lockedCourse = Course::query()->lockForUpdate()->findOrFail($course->id);
            $this->ensureCourseIsActive($lockedCourse);

            $existingEnrollment = CourseEnrollment::withTrashed()
                ->where('student_id', $studentId)
                ->where('course_id', $lockedCourse->id)
                ->first();

            if ($existingEnrollment && ! $existingEnrollment->trashed()) {
                abort(409, 'Anda sudah memiliki enrollment pada mata kuliah ini.');
            }

            if ($existingEnrollment && $existingEnrollment->trashed()) {
                abort(409, 'Enrollment pernah dibatalkan. Gunakan fitur ajukan ulang.');
            }

            $this->ensureCapacityAvailable($lockedCourse);

            return CourseEnrollment::create([
                'student_id' => $studentId,
                'course_id' => $lockedCourse->id,
                'status' => 'pending',
            ]);
        });

        return response()->json([
            'message' => 'Pengajuan enrollment berhasil dikirim.',
            'enrollment' => $this->enrollmentResponse($enrollment),
        ], 201);
    }

    /**
     * Mengaktifkan kembali enrollment yang sebelumnya dibatalkan.
     */
    public function update(Request $request, Course $course): JsonResponse
    {
        $studentId = $this->studentId($request);
        $this->ensureCourseIsActive($course);

        $enrollment = DB::transaction(function () use ($course, $studentId) {
            $lockedCourse = Course::query()->lockForUpdate()->findOrFail($course->id);
            $this->ensureCourseIsActive($lockedCourse);

            $enrollment = CourseEnrollment::withTrashed()
                ->where('student_id', $studentId)
                ->where('course_id', $lockedCourse->id)
                ->firstOrFail();

            if (! $enrollment->trashed()) {
                if ($enrollment->status === 'approved') {
                    abort(422, 'Enrollment yang sudah disetujui tidak dapat diajukan ulang.');
                }

                $enrollment->touch();

                return $enrollment;
            }

            $this->ensureCapacityAvailable($lockedCourse);

            $enrollment->restore();
            $enrollment->update(['status' => 'pending']);

            return $enrollment->fresh();
        });

        return response()->json([
            'message' => 'Pengajuan enrollment berhasil diajukan ulang.',
            'enrollment' => $this->enrollmentResponse($enrollment),
        ]);
    }

    /**
     * Membatalkan enrollment milik mahasiswa login.
     */
    public function destroy(Request $request, Course $course): JsonResponse
    {
        $studentId = $this->studentId($request);

        $enrollment = CourseEnrollment::query()
            ->where('student_id', $studentId)
            ->where('course_id', $course->id)
            ->firstOrFail();

        $enrollment->delete();

        return response()->json([
            'message' => $enrollment->status === 'approved'
                ? 'Anda berhasil keluar dari mata kuliah.'
                : 'Pengajuan enrollment berhasil dibatalkan.',
        ]);
    }

    private function studentId(Request $request): int
    {
        $user = $request->user();

        abort_unless($user && $user->role === 'student', 403, 'Akses hanya untuk mahasiswa.');

        return (int) $user->id;
    }

    private function ensureCourseIsActive(Course $course): void
    {
        abort_unless($course->status === 'active', 422, 'Mata kuliah ini sedang tidak aktif.');
    }

    private function ensureCapacityAvailable(Course $course): void
    {
        $capacity = (int) ($course->capacity ?? 0);

        if ($capacity <= 0) {
            return;
        }

        $activeEnrollmentCount = CourseEnrollment::query()
            ->where('course_id', $course->id)
            ->count();

        abort_if(
            $activeEnrollmentCount >= $capacity,
            422,
            'Kapasitas mata kuliah sudah penuh.'
        );
    }

    private function courseResponse(Course $course): array
    {
        /** @var CourseEnrollment|null $enrollment */
        $enrollment = $course->enrollments->first();
        $hasPreviousEnrollment = $enrollment !== null;
        $isCancelled = $enrollment?->trashed() ?? false;
        $enrollmentStatus = $isCancelled ? null : $enrollment?->status;
        $totalWeeks = max(1, (int) ($course->total_weeks ?? 17));
        $accessibleWeeks = min(
            $totalWeeks,
            (int) ($course->accessible_weeks_count ?? 0)
        );
        $progress = $enrollmentStatus === 'approved'
            ? (int) round(($accessibleWeeks / $totalWeeks) * 100)
            : 0;
        $capacity = (int) ($course->capacity ?? 50);
        $approvedStudents = (int) ($course->approved_students_count ?? 0);
        $activeRequests = (int) ($course->enrollment_requests_count ?? 0);

        return [
            'id' => (int) $course->id,
            'title' => $course->title,
            'code' => $course->code,
            'description' => $course->description ?? '',
            'professor' => $course->professor?->name,
            'status' => $course->status,
            'capacity' => $capacity,
            'approved_students_count' => $approvedStudents,
            'total_weeks' => $totalWeeks,
            'accessible_weeks_count' => $accessibleWeeks,
            'progress' => $progress,
            'enrollment_id' => $isCancelled ? null : $enrollment?->id,
            'enrollment_status' => $enrollmentStatus,
            'has_previous_enrollment' => $hasPreviousEnrollment,
            'is_full' => $capacity > 0 && $activeRequests >= $capacity,
        ];
    }

    private function enrollmentResponse(CourseEnrollment $enrollment): array
    {
        return [
            'id' => (int) $enrollment->id,
            'student_id' => (int) $enrollment->student_id,
            'course_id' => (int) $enrollment->course_id,
            'status' => $enrollment->status,
            'created_at' => $enrollment->created_at?->toISOString(),
            'updated_at' => $enrollment->updated_at?->toISOString(),
        ];
    }
}

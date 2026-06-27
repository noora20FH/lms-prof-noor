<?php

namespace App\Http\Controllers\Professor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    /**
     * Menampilkan seluruh enrollment mahasiswa pada course milik professor.
     */
    public function index(Request $request)
    {
        $this->ensureProfessor($request);

        $enrollments = CourseEnrollment::query()
            ->with([
                'student:id,name,nim,class_,email',
                'course:id,professor_id,title',
            ])
            ->whereHas('course', function ($query) use ($request) {
                $query->where('professor_id', $request->user()->id);
            })
            ->latest('id')
            ->get()
            ->filter(fn (CourseEnrollment $enrollment) => $enrollment->student && $enrollment->course)
            ->map(fn (CourseEnrollment $enrollment) => $this->enrollmentResponse($enrollment))
            ->values();

        return response()->json([
            'students' => $enrollments,
            'total' => $enrollments->count(),
        ]);
    }

    /**
     * Menampilkan satu data enrollment milik professor.
     */
    public function show(Request $request, int $enrollmentId)
    {
        $this->ensureProfessor($request);

        $enrollment = $this->ownedEnrollment($request, $enrollmentId);

        return response()->json([
            'student' => $this->enrollmentResponse($enrollment),
        ]);
    }

    /**
     * Mengambil mahasiswa yang belum terdaftar pada course tertentu.
     */
    public function availableStudents(Request $request)
    {
        $this->ensureProfessor($request);

        $validated = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
        ]);

        $course = $this->ownedCourse($request, (int) $validated['course_id']);

        $enrolledStudentIds = CourseEnrollment::query()
            ->where('course_id', $course->id)
            ->pluck('student_id');

        $students = User::query()
            ->where('role', 'student')
            ->whereNotIn('id', $enrolledStudentIds)
            ->orderBy('name')
            ->get(['id', 'name', 'nim', 'class_', 'email']);

        return response()->json([
            'students' => $students,
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
            ],
        ]);
    }

    /**
     * Membuat enrollment dari modal Undang Mahasiswa.
     */
    public function enroll(Request $request)
    {
        $this->ensureProfessor($request);

        $validated = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'student_ids' => ['required', 'array', 'min:1'],
            'student_ids.*' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('users', 'id')->where(fn ($query) => $query->where('role', 'student')),
            ],
        ]);

        $course = $this->ownedCourse($request, (int) $validated['course_id']);
        $studentIds = array_values(array_unique(array_map('intval', $validated['student_ids'])));

        $createdEnrollments = DB::transaction(function () use ($course, $studentIds) {
            $activeEnrollmentCount = CourseEnrollment::query()
                ->where('course_id', $course->id)
                ->count();

            $newStudentCount = CourseEnrollment::withTrashed()
                ->where('course_id', $course->id)
                ->whereIn('student_id', $studentIds)
                ->get()
                ->filter(fn (CourseEnrollment $enrollment) => $enrollment->trashed())
                ->count();

            $brandNewStudentCount = count($studentIds) - CourseEnrollment::withTrashed()
                ->where('course_id', $course->id)
                ->whereIn('student_id', $studentIds)
                ->count();

            $additionalCount = $newStudentCount + $brandNewStudentCount;
            $capacity = (int) ($course->capacity ?? 0);

            if ($capacity > 0 && ($activeEnrollmentCount + $additionalCount) > $capacity) {
                abort(422, 'Kapasitas mata kuliah tidak mencukupi untuk undangan ini.');
            }

            $saved = collect();

            foreach ($studentIds as $studentId) {
                $enrollment = CourseEnrollment::withTrashed()
                    ->where('course_id', $course->id)
                    ->where('student_id', $studentId)
                    ->first();

                if ($enrollment && ! $enrollment->trashed()) {
                    continue;
                }

                if ($enrollment) {
                    $enrollment->restore();
                    $enrollment->update(['status' => 'pending']);
                } else {
                    $enrollment = CourseEnrollment::create([
                        'student_id' => $studentId,
                        'course_id' => $course->id,
                        'status' => 'pending',
                    ]);
                }

                $saved->push($enrollment->load([
                    'student:id,name,nim,class_,email',
                    'course:id,professor_id,title',
                ]));
            }

            return $saved;
        });

        return response()->json([
            'message' => $createdEnrollments->count().' mahasiswa berhasil diundang.',
            'enrolled_count' => $createdEnrollments->count(),
            'students' => $createdEnrollments
                ->map(fn (CourseEnrollment $enrollment) => $this->enrollmentResponse($enrollment))
                ->values(),
        ], 201);
    }

    /**
     * Memperbarui status enrollment.
     */
    public function update(Request $request, int $enrollmentId)
    {
        $this->ensureProfessor($request);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['pending', 'approved'])],
        ]);

        $enrollment = $this->ownedEnrollment($request, $enrollmentId);
        $enrollment->update(['status' => $validated['status']]);
        $enrollment->refresh()->load([
            'student:id,name,nim,class_,email',
            'course:id,professor_id,title',
        ]);

        return response()->json([
            'message' => 'Status mahasiswa berhasil diperbarui.',
            'student' => $this->enrollmentResponse($enrollment),
        ]);
    }

    /**
     * Endpoint kompatibilitas untuk tombol Approve yang sudah ada.
     */
    public function approve(Request $request, int $enrollmentId)
    {
        $request->merge(['status' => 'approved']);

        return $this->update($request, $enrollmentId);
    }

    /**
     * Menghapus enrollment mahasiswa dari course.
     */
    public function destroy(Request $request, int $enrollmentId)
    {
        $this->ensureProfessor($request);

        $enrollment = $this->ownedEnrollment($request, $enrollmentId);
        $enrollment->delete();

        return response()->json([
            'message' => 'Mahasiswa berhasil dihapus dari mata kuliah.',
        ]);
    }

    /**
     * Alias kompatibilitas dengan nama method lama.
     */
    public function reject(Request $request, int $enrollmentId)
    {
        return $this->destroy($request, $enrollmentId);
    }

    private function ownedCourse(Request $request, int $courseId): Course
    {
        return Course::query()
            ->whereKey($courseId)
            ->where('professor_id', $request->user()->id)
            ->firstOrFail();
    }

    private function ownedEnrollment(Request $request, int $enrollmentId): CourseEnrollment
    {
        return CourseEnrollment::query()
            ->with([
                'student:id,name,nim,class_,email',
                'course:id,professor_id,title',
            ])
            ->whereKey($enrollmentId)
            ->whereHas('course', function ($query) use ($request) {
                $query->where('professor_id', $request->user()->id);
            })
            ->firstOrFail();
    }

    private function enrollmentResponse(CourseEnrollment $enrollment): array
    {
        return [
            'id' => $enrollment->student->id,
            'enrollment_id' => $enrollment->id,
            'name' => $enrollment->student->name,
            'nim' => $enrollment->student->nim ?? '',
            'class_' => $enrollment->student->class_ ?? null,
            'email' => $enrollment->student->email,
            'status' => $enrollment->status,
            'course' => $enrollment->course->title,
            'courseId' => $enrollment->course_id,
            'created_at' => $enrollment->created_at,
            'updated_at' => $enrollment->updated_at,
        ];
    }

    private function ensureProfessor(Request $request): void
    {
        if ($request->user()->role !== 'professor') {
            abort(403, 'Akses hanya untuk professor.');
        }
    }
}

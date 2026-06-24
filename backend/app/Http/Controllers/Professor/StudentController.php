<?php

namespace App\Http\Controllers\Professor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $this->ensureProfessor($request);
        $professorId = $request->user()->id;

        $enrollments = CourseEnrollment::with([
                'student:id,name,nim,class_,email',
                'course:id,title'
            ])
            ->whereHas('course', fn($q) => $q->where('professor_id', $professorId))
            ->orderBy('id', 'desc')
            ->get();

        $students = $enrollments->map(fn($e) => [
            'id'            => $e->student->id,
            'name'          => $e->student->name,
            'nim'           => $e->student->nim ?? '',
            'class_'        => $e->student->class_ ?? null,
            'email'         => $e->student->email,
            'status'        => $e->status,
            'course'        => $e->course->title,
            'courseId'      => $e->course_id,
            'enrollment_id' => $e->id,
        ])->values();

        return response()->json(['students' => $students, 'total' => $students->count()]);
    }

    // === FITUR BARU: Ambil mahasiswa yang BELUM terdaftar di course tertentu ===
    public function availableStudents(Request $request)
    {
        $this->ensureProfessor($request);

        $validated = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
        ]);

        $professorId = $request->user()->id;
        $courseId = $validated['course_id'];

        $course = Course::where('id', $courseId)->where('professor_id', $professorId)->firstOrFail();

        $enrolledIds = CourseEnrollment::where('course_id', $courseId)->pluck('student_id');

        $available = User::where('role', 'student')
            ->whereNotIn('id', $enrolledIds)
            ->orderBy('name')
            ->get(['id', 'name', 'nim', 'class_', 'email']);

        return response()->json([
            'students' => $available,
            'course' => ['id' => $course->id, 'title' => $course->title],
        ]);
    }

    // === FITUR BARU: Enroll mahasiswa ke course ===
    public function enroll(Request $request)
    {
        $this->ensureProfessor($request);

        $validated = $request->validate([
            'course_id'   => ['required', 'integer', 'exists:courses,id'],
            'student_ids' => ['required', 'array', 'min:1'],
            'student_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $professorId = $request->user()->id;
        $courseId = $validated['course_id'];
        $studentIds = $validated['student_ids'];

        Course::where('id', $courseId)->where('professor_id', $professorId)->firstOrFail();

        $enrolledCount = 0;

        DB::beginTransaction();
        try {
            foreach ($studentIds as $studentId) {
                $exists = CourseEnrollment::where('course_id', $courseId)
                    ->where('student_id', $studentId)->exists();

                if (!$exists) {
                    CourseEnrollment::create([
                        'student_id' => $studentId,
                        'course_id'  => $courseId,
                        'status'     => 'pending',
                    ]);
                    $enrolledCount++;
                }
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menambahkan mahasiswa.'], 500);
        }

        return response()->json([
            'message' => "$enrolledCount mahasiswa berhasil ditambahkan.",
            'enrolled_count' => $enrolledCount,
        ]);
    }

    public function approve(Request $request, int $enrollmentId) { /* ... kode sebelumnya ... */ }
    public function reject(Request $request, int $enrollmentId) { /* ... kode sebelumnya ... */ }

    private function ensureProfessor(Request $request): void
    {
        if ($request->user()->role !== 'professor') abort(403);
    }
}

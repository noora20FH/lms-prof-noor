<?php

namespace App\Http\Controllers\Professor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\Submission;
use Illuminate\Http\Request;

class ProfessorDashboardController extends Controller
{
    /**
     * Mengambil seluruh data yang dibutuhkan halaman dashboard professor.
     */
    public function index(Request $request)
    {
        $this->ensureProfessor($request);

        $professorId = (int) $request->user()->id;

        $courseCount = Course::query()
            ->where('professor_id', $professorId)
            ->count();

        $activeStudentCount = CourseEnrollment::query()
            ->where('status', 'approved')
            ->whereHas('course', function ($query) use ($professorId) {
                $query->where('professor_id', $professorId);
            })
            ->distinct()
            ->count('student_id');

        $pendingAssignmentCount = Submission::query()
            ->where('status', 'submitted')
            ->whereHas('assignment.week.course', function ($query) use ($professorId) {
                $query->where('professor_id', $professorId);
            })
            ->count();

        $recentSubmissions = Submission::query()
            ->with([
                'student:id,name,nim,class_',
                'assignment:id,week_id,title',
                'assignment.week:id,course_id,week_number',
                'assignment.week.course:id,professor_id,title',
            ])
            ->whereHas('assignment.week.course', function ($query) use ($professorId) {
                $query->where('professor_id', $professorId);
            })
            ->orderByDesc('submitted_at')
            ->orderByDesc('id')
            ->limit(10)
            ->get()
            ->filter(function (Submission $submission) {
                return $submission->student
                    && $submission->assignment
                    && $submission->assignment->week
                    && $submission->assignment->week->course;
            })
            ->map(function (Submission $submission) {
                $week = $submission->assignment->week;
                $course = $week->course;
                $submittedAt = $submission->submitted_at ?? $submission->created_at;

                return [
                    'id' => $submission->id,
                    'student_name' => $submission->student->name,
                    'nim' => $submission->student->nim ?? '',
                    'class_' => $submission->student->class_ ?? '',
                    'assignment_title' => $submission->assignment->title,
                    'course' => $course->title,
                    'course_id' => $course->id,
                    'week' => (int) $week->week_number,
                    'submitted_at' => $submittedAt?->toIso8601String(),
                    'status' => $submission->status,
                ];
            })
            ->values();

        return response()->json([
            'stats' => [
                'courses' => $courseCount,
                'active_students' => $activeStudentCount,
                'pending_assignments' => $pendingAssignmentCount,
            ],
            'recent_submissions' => $recentSubmissions,
        ]);
    }

    private function ensureProfessor(Request $request): void
    {
        if ($request->user()->role !== 'professor') {
            abort(403, 'Akses hanya untuk professor.');
        }
    }
}

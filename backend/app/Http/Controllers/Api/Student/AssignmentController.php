<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AssignmentController extends Controller
{
    /**
     * GET /api/student/assignments
     * Mengembalikan data tugas student yang sudah di-enroll (approved)
     */
    public function index(Request $request)
    {
        $student = Auth::user();

        if (!$student || $student->role !== 'student') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Ambil hanya course yang sudah approved
        $enrolledCourseIds = $student->enrollments()
            ->where('status', 'approved')
            ->pluck('course_id');

        if ($enrolledCourseIds->isEmpty()) {
            return response()->json([
                'pending' => [],
                'submitted' => [],
            ]);
        }

        // Ambil assignments + relasi
        $assignments = Assignment::whereHas('week.course', function ($q) use ($enrolledCourseIds) {
                $q->whereIn('id', $enrolledCourseIds);
            })
            ->with([
                'week.course',
                'submissions' => function ($q) use ($student) {
                    $q->where('student_id', $student->id);
                }
            ])
            ->orderBy('end_date', 'asc')
            ->get();

        $pending = [];
        $submitted = [];

        foreach ($assignments as $assignment) {
            $submission = $assignment->submissions->first();
            $course = $assignment->week->course;

            $endDate = $assignment->end_date;
            $daysLeft = $endDate ? now()->diffInDays($endDate, false) : 0;
            $dueDateFormatted = $endDate ? $endDate->format('d M Y') : '-';

            $item = [
                'id'            => $assignment->id,
                'title'         => $assignment->title,
                'course'        => $course->title,
                'courseId'      => $course->id,
                'week'          => $assignment->week->week_number,
                'dueDate'       => $dueDateFormatted,
                'daysLeft'      => (int) $daysLeft,
                'status'        => $submission
                    ? ($submission->score !== null ? 'graded' : 'submitted')
                    : 'pending',
                'submittedDate' => $submission && $submission->submitted_at
                    ? $submission->submitted_at->format('d M Y')
                    : null,
                'score'         => $submission?->score,
            ];

            if ($item['status'] === 'pending') {
                $pending[] = $item;
            } else {
                $submitted[] = $item;
            }
        }

        return response()->json([
            'pending'   => $pending,
            'submitted' => $submitted,
        ]);
    }
}

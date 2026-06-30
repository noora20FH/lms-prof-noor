<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\CourseEnrollment;
use App\Models\Assignment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class StudentDashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // 1. Ambil Kelas yang Diikuti (Telah disetujui)
        $enrolledCourses = CourseEnrollment::with(['course' => function ($query) {
            $query->withCount(['weeks as accessible_weeks_count' => function ($q) {
                $q->whereNotNull('unlock_at')->where('unlock_at', '<=', now());
            }]);
        }])
            ->where('student_id', $user->id)
            ->where('status', 'approved')
            ->get()
            ->map(function ($enrollment) {
                $course = $enrollment->course;
                
                // Menghitung persentase progress belajar
                $progress = $course->total_weeks > 0
                    ? round(($course->accessible_weeks_count / $course->total_weeks) * 100)
                    : 0;

                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'progress' => $progress,
                ];
            });

        // 2. Ambil Tugas Pending (Belum dikerjakan, termasuk yang terlambat / tanpa batas waktu)
        $pendingAssignments = Assignment::with(['week.course'])
            ->whereHas('week.course.enrollments', function ($query) use ($user) {
                $query->where('student_id', $user->id)
                      ->where('status', 'approved');
            })
            ->whereHas('week', function ($query) {
                // Pastikan week / minggu materi sudah dibuka
                $query->whereNotNull('unlock_at')->where('unlock_at', '<=', now());
            })
            ->where(function ($query) {
                // Tugas sudah bisa mulai dikerjakan atau tidak memiliki start_date
                $query->whereNull('start_date')
                      ->orWhere('start_date', '<=', now());
            })
            ->whereDoesntHave('submissions', function ($query) use ($user) {
                // Pastikan siswa ini belum mensubmit tugas tersebut
                $query->where('student_id', $user->id);
            })
            // Urutkan tugas: yang memiliki tenggat terdekat di atas, yang NULL (tanpa tenggat) di bawah
            ->orderByRaw('ISNULL(end_date), end_date ASC')
            ->take(5)
            ->get()
            ->map(function ($assignment) {
                // Cek apakah tugas ini punya end_date atau tidak
                $hasDeadline = !is_null($assignment->end_date);
                $isOverdue = false;
                $daysDiff = 0;

                if ($hasDeadline) {
                    // Jadikan end_date sampai jam 23:59:59 di hari tersebut
                    $endDate = Carbon::parse($assignment->end_date)->endOfDay();
                    
                    // Cek keterlambatan
                    $isOverdue = now()->greaterThan($endDate);
                    
                    // Hitung selisih hari murni (integer)
                    $daysDiff = now()->startOfDay()->diffInDays($endDate->startOfDay(), false);
                }

                return [
                    'id' => $assignment->id,
                    'title' => $assignment->title,
                    'course' => $assignment->week->course->title,
                    'courseId' => $assignment->week->course->id,
                    'week' => $assignment->week->week_number,
                    'daysLeft' => (int) $daysDiff,
                    'isOverdue' => $isOverdue,
                    'hasDeadline' => $hasDeadline 
                ];
            });

        return response()->json([
            'courses' => $enrolledCourses,
            'pending' => $pendingAssignments,
        ]);
    }
}
<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Throwable;

class StudentDashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $userId = (int) $user->id;
        $now = now();

        try {
            /*
             * Ambil kelas yang sudah disetujui.
             * Query Builder dipakai agar endpoint dashboard tidak bergantung
             * pada nama relationship Eloquent yang mungkin belum didefinisikan.
             */
            $enrolledCourses = DB::table('course_enrollments as ce')
                ->join('courses as c', 'c.id', '=', 'ce.course_id')
                ->leftJoin('weeks as w', function (JoinClause $join) use ($now) {
                    $join->on('w.course_id', '=', 'c.id')
                        ->whereNotNull('w.unlock_at')
                        ->where('w.unlock_at', '<=', $now);
                })
                ->where('ce.student_id', $userId)
                ->where('ce.status', 'approved')
                ->whereNull('ce.deleted_at')
                ->where('c.status', 'active')
                ->groupBy('c.id', 'c.title', 'c.total_weeks')
                ->orderBy('c.title')
                ->select([
                    'c.id',
                    'c.title',
                    'c.total_weeks',
                    DB::raw('COUNT(w.id) as accessible_weeks_count'),
                ])
                ->get()
                ->map(function (object $course): array {
                    $totalWeeks = (int) $course->total_weeks;
                    $accessibleWeeks = (int) $course->accessible_weeks_count;

                    $progress = $totalWeeks > 0
                        ? (int) round(($accessibleWeeks / $totalWeeks) * 100)
                        : 0;

                    return [
                        'id' => (int) $course->id,
                        'title' => (string) $course->title,
                        'progress' => max(0, min(100, $progress)),
                    ];
                })
                ->values();

            /*
             * Ambil maksimal lima tugas dari kelas yang sudah approved,
             * minggu sudah dibuka, dan belum pernah dikumpulkan mahasiswa.
             */
            $pendingAssignments = DB::table('assignments as a')
                ->join('weeks as w', 'w.id', '=', 'a.week_id')
                ->join('courses as c', 'c.id', '=', 'w.course_id')
                ->join('course_enrollments as ce', function (JoinClause $join) use ($userId) {
                    $join->on('ce.course_id', '=', 'c.id')
                        ->where('ce.student_id', '=', $userId)
                        ->where('ce.status', '=', 'approved')
                        ->whereNull('ce.deleted_at');
                })
                ->leftJoin('submissions as s', function (JoinClause $join) use ($userId) {
                    $join->on('s.assignment_id', '=', 'a.id')
                        ->where('s.student_id', '=', $userId);
                })
                ->where('c.status', 'active')
                ->whereNotNull('w.unlock_at')
                ->where('w.unlock_at', '<=', $now)
                ->where(function ($query) use ($now) {
                    $query->whereNull('a.start_date')
                        ->orWhere('a.start_date', '<=', $now);
                })
                ->whereNull('s.id')
                ->orderByRaw('CASE WHEN a.end_date IS NULL THEN 1 ELSE 0 END ASC')
                ->orderBy('a.end_date')
                ->limit(5)
                ->select([
                    'a.id',
                    'a.title',
                    'a.end_date',
                    'c.id as course_id',
                    'c.title as course_title',
                    'w.week_number',
                ])
                ->get()
                ->map(function (object $assignment) use ($now): array {
                    $hasDeadline = $assignment->end_date !== null;
                    $isOverdue = false;
                    $daysDiff = 0;

                    if ($hasDeadline) {
                        $deadline = Carbon::parse($assignment->end_date)->endOfDay();
                        $isOverdue = $now->greaterThan($deadline);
                        $daysDiff = (int) $now->copy()
                            ->startOfDay()
                            ->diffInDays($deadline->copy()->startOfDay(), false);
                    }

                    return [
                        'id' => (int) $assignment->id,
                        'title' => (string) $assignment->title,
                        'course' => (string) $assignment->course_title,
                        'courseId' => (int) $assignment->course_id,
                        'week' => (int) $assignment->week_number,
                        'daysLeft' => $daysDiff,
                        'isOverdue' => $isOverdue,
                        'hasDeadline' => $hasDeadline,
                    ];
                })
                ->values();

            return response()->json([
                'courses' => $enrolledCourses,
                'pending' => $pendingAssignments,
            ]);
        } catch (Throwable $error) {
            report($error);

            return response()->json([
                'message' => app()->isLocal()
                    ? $error->getMessage()
                    : 'Failed to load student dashboard.',
            ], 500);
        }
    }
}

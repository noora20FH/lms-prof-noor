<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentSubmissionController extends Controller
{
    public function store(Request $request, Assignment $assignment): JsonResponse
    {
        $user = $request->user();

        abort_unless($user && $user->role === 'student', 403, 'Akses hanya untuk mahasiswa.');

        $assignment->loadMissing(['week.course']);

        $course = $assignment->week->course;
        $week = $assignment->week;

        $isEnrolled = $course->enrollments()
            ->where('student_id', $user->id)
            ->where('status', 'approved')
            ->exists();

        abort_unless($isEnrolled, 403, 'Anda tidak terdaftar pada mata kuliah ini.');

        abort_if(
            ! $week->unlock_at || $week->unlock_at->isFuture(),
            403,
            'Week ini belum dapat diakses.'
        );

        abort_if(
            $assignment->start_date && $assignment->start_date->isFuture(),
            422,
            'Waktu pengumpulan tugas belum dimulai.'
        );

        abort_if(
            $assignment->end_date
                && now()->startOfDay()->gt($assignment->end_date->copy()->startOfDay()),
            422,
            'Batas waktu pengumpulan tugas telah berakhir.'
        );

        $validated = $request->validate([
            'link_url' => ['required', 'url:http,https', 'max:255'],
        ], [
            'link_url.required' => 'Link tugas wajib diisi.',
            'link_url.url' => 'Link tugas harus berupa URL yang valid.',
            'link_url.max' => 'Link tugas maksimal 255 karakter.',
        ]);

        $submission = DB::transaction(function () use ($assignment, $user, $validated) {
            $submission = Submission::query()
                ->where('assignment_id', $assignment->id)
                ->where('student_id', $user->id)
                ->lockForUpdate()
                ->first();

            abort_if(
                $submission && $submission->status === 'graded',
                422,
                'Tugas yang sudah dinilai tidak dapat dikirim ulang.'
            );

            if (! $submission) {
                $submission = new Submission([
                    'assignment_id' => $assignment->id,
                    'student_id' => $user->id,
                ]);
            }

            $submission->fill([
                'file_url' => null,
                'link_url' => $validated['link_url'],
                'submitted_at' => now(),
                'score' => null,
                'feedback' => null,
                'graded_at' => null,
                'graded_by' => null,
                'status' => 'submitted',
            ]);

            $submission->save();

            return $submission->fresh();
        });

        return response()->json([
            'message' => 'Tugas berhasil dikumpulkan.',
            'data' => [
                'id' => (int) $submission->id,
                'link_url' => $submission->link_url,
                'submitted_at' => $submission->submitted_at?->toISOString(),
                'score' => $submission->score,
                'feedback' => $submission->feedback,
                'status' => $submission->status,
            ],
        ], 201);
    }
}

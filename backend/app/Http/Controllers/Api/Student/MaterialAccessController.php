<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class MaterialAccessController extends Controller
{
    public function open(Request $request, Material $material): Response
    {
        $user = $request->user();

        abort_unless($user && $user->role === 'student', 403, 'Akses hanya untuk mahasiswa.');

        $material->loadMissing(['week.course']);

        $week = $material->week;
        $course = $week?->course;

        abort_unless($week && $course, 404, 'Materi tidak ditemukan.');

        $isEnrolled = $course->enrollments()
            ->where('student_id', $user->id)
            ->where('status', 'approved')
            ->exists();

        abort_unless($isEnrolled, 403, 'Anda tidak terdaftar pada mata kuliah ini.');

        abort_if(
            ! $week->unlock_at || $week->unlock_at->isFuture(),
            403,
            'Materi pada week ini belum dapat diakses.'
        );

        $contentUrl = trim((string) $material->content_url);

        abort_if($contentUrl === '', 404, 'File atau tautan materi tidak tersedia.');

        if (preg_match('#^https?://#i', $contentUrl) === 1) {
            return redirect()->away($contentUrl);
        }

        $disk = Storage::disk('public');

        abort_unless($disk->exists($contentUrl), 404, 'File materi tidak ditemukan.');

        return $disk->response(
            $contentUrl,
            basename($contentUrl),
            ['Content-Disposition' => 'inline; filename="' . basename($contentUrl) . '"']
        );
    }
}

<?php

namespace App\Http\Controllers\Professor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Material;
use App\Models\Week;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class MaterialController extends Controller
{
    /**
     * UI lama masih menampilkan opsi "Video", tetapi migration terbaru kamu
     * menyimpan video URL sebagai enum "video_link".
     */
    private array $requestTypes = ['pdf', 'ppt', 'video', 'video_link', 'yt_link'];

    private array $fileTypes = ['pdf', 'ppt', 'video'];

    public function courses(Request $request)
    {
        $this->ensureProfessor($request);

        $selectColumns = ['id', 'title'];

        foreach (['description', 'code', 'status', 'total_weeks'] as $column) {
            if (Schema::hasColumn('courses', $column)) {
                $selectColumns[] = $column;
            }
        }

        $courses = Course::query()
            ->where('professor_id', $request->user()->id)
            ->orderBy('title')
            ->get($selectColumns)
            ->map(function (Course $course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'code' => $course->code ?? null,
                    'description' => $course->description ?? null,
                    'status' => $course->status ?? 'active',
                    'total_weeks' => $course->total_weeks ?? 17,
                ];
            })
            ->values();

        return response()->json([
            'courses' => $courses,
        ]);
    }

    public function index(Request $request)
    {
        $this->ensureProfessor($request);

        $validated = $request->validate([
            'course_id' => ['nullable', 'integer', 'exists:courses,id'],
        ]);

        if (! empty($validated['course_id'])) {
            $this->getOwnedCourse((int) $validated['course_id'], $request->user()->id);
        }

        $materials = Material::query()
            ->with(['week.course'])
            ->whereHas('week.course', function ($query) use ($request) {
                $query->where('professor_id', $request->user()->id);
            })
            ->when(! empty($validated['course_id']), function ($query) use ($validated) {
                $query->whereHas('week', function ($weekQuery) use ($validated) {
                    $weekQuery->where('course_id', $validated['course_id']);
                });
            })
            ->get()
            ->sortBy([
                fn (Material $a, Material $b) => $a->week->week_number <=> $b->week->week_number,
                fn (Material $a, Material $b) => strcmp($a->title, $b->title),
            ])
            ->values()
            ->map(fn (Material $material) => $this->materialResponse($material));

        return response()->json([
            'materials' => $materials,
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureProfessor($request);

        $validated = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'week_number' => ['required', 'integer', 'min:1', 'max:17'],
            'week_title' => ['nullable', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in($this->requestTypes)],
            'content_url' => ['nullable', 'url', 'max:500'],
            'file' => ['nullable', 'file', 'max:204800'],
        ]);

        $course = $this->getOwnedCourse((int) $validated['course_id'], $request->user()->id);
        $weekNumber = (int) $validated['week_number'];

        $week = Week::firstOrCreate(
            [
                'course_id' => $course->id,
                'week_number' => $weekNumber,
            ],
            $this->weekCreateDefaults($validated['week_title'] ?? null, $weekNumber)
        );

        $contentUrl = $this->resolveContentUrl(
            $request,
            $validated['type'],
            $course->id,
            $weekNumber
        );

        $material = Material::create([
            'week_id' => $week->id,
            'title' => $validated['title'],
            'type' => $this->normalizeMaterialTypeForDatabase($validated['type']),
            'content_url' => $contentUrl,
        ]);

        return response()->json([
            'message' => 'Materi berhasil ditambahkan.',
            'material' => $this->materialResponse($material->load(['week.course'])),
        ], 201);
    }

    public function update(Request $request, Material $material)
    {
        $this->ensureProfessor($request);
        $this->ensureMaterialOwner($material, $request->user()->id);

        $validated = $request->validate([
            'course_id' => ['nullable', 'integer', 'exists:courses,id'],
            'week_number' => ['nullable', 'integer', 'min:1', 'max:17'],
            'week_title' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', Rule::in($this->requestTypes)],
            'content_url' => ['nullable', 'url', 'max:500'],
            'file' => ['nullable', 'file', 'max:204800'],
        ]);

        $material->loadMissing(['week.course']);

        $courseId = (int) ($validated['course_id'] ?? $material->week->course_id);
        $weekNumber = (int) ($validated['week_number'] ?? $material->week->week_number);
        $newType = $validated['type'] ?? $material->type;

        $course = $this->getOwnedCourse($courseId, $request->user()->id);

        $week = Week::firstOrCreate(
            [
                'course_id' => $course->id,
                'week_number' => $weekNumber,
            ],
            $this->weekCreateDefaults($validated['week_title'] ?? null, $weekNumber)
        );

        $updates = [
            'week_id' => $week->id,
            'type' => $this->normalizeMaterialTypeForDatabase($newType),
        ];

        if (array_key_exists('title', $validated)) {
            $updates['title'] = $validated['title'];
        }

        if ($request->hasFile('file')) {
            $this->deleteStoredFile($material->content_url);
            $updates['content_url'] = $this->storeUploadedFile($request, $newType, $course->id, $weekNumber);
        } elseif (array_key_exists('content_url', $validated) && ! empty($validated['content_url'])) {
            $this->deleteStoredFile($material->content_url);
            $updates['content_url'] = trim($validated['content_url']);
        }

        $material->update($updates);

        return response()->json([
            'message' => 'Materi berhasil diperbarui.',
            'material' => $this->materialResponse($material->fresh(['week.course'])),
        ]);
    }

    public function destroy(Request $request, Material $material)
    {
        $this->ensureProfessor($request);
        $this->ensureMaterialOwner($material, $request->user()->id);

        $this->deleteStoredFile($material->content_url);

        $material->delete();

        return response()->json([
            'message' => 'Materi berhasil dihapus.',
        ]);
    }

    private function ensureProfessor(Request $request): void
    {
        if ($request->user()->role !== 'professor') {
            abort(403, 'Akses hanya untuk professor.');
        }
    }

    private function getOwnedCourse(int $courseId, int $professorId): Course
    {
        return Course::query()
            ->where('id', $courseId)
            ->where('professor_id', $professorId)
            ->firstOrFail();
    }

    private function ensureMaterialOwner(Material $material, int $professorId): void
    {
        $material->loadMissing(['week.course']);

        if ((int) $material->week?->course?->professor_id !== $professorId) {
            abort(403, 'Anda tidak memiliki akses ke materi ini.');
        }
    }

    private function weekCreateDefaults(?string $weekTitle, int $weekNumber): array
    {
        if (! Schema::hasColumn('weeks', 'title')) {
            return [];
        }

        return [
            'title' => $weekTitle ?: 'Week ' . $weekNumber,
        ];
    }

    private function resolveContentUrl(Request $request, string $type, int $courseId, int $weekNumber): string
    {
        if ($request->hasFile('file')) {
            return $this->storeUploadedFile($request, $type, $courseId, $weekNumber);
        }

        $contentUrl = trim((string) $request->input('content_url'));

        if ($contentUrl === '') {
            throw ValidationException::withMessages([
                'content_url' => ['Link / URL materi wajib diisi.'],
            ]);
        }

        return $contentUrl;
    }

    private function storeUploadedFile(Request $request, string $type, int $courseId, int $weekNumber): string
    {
        if (! in_array($type, $this->fileTypes, true)) {
            throw ValidationException::withMessages([
                'file' => ['Upload file hanya didukung untuk tipe PDF, PPT, atau Video.'],
            ]);
        }

        $file = $request->file('file');

        $allowedExtensions = [
            'pdf' => ['pdf'],
            'ppt' => ['ppt', 'pptx'],
            'video' => ['mp4', 'mov', 'avi', 'mkv', 'webm'],
        ];

        $extension = strtolower($file->getClientOriginalExtension());

        if (! in_array($extension, $allowedExtensions[$type] ?? [], true)) {
            throw ValidationException::withMessages([
                'file' => ['Format file tidak sesuai dengan tipe materi yang dipilih.'],
            ]);
        }

        return $file->store("materials/course-{$courseId}/week-{$weekNumber}", 'public');
    }

    private function deleteStoredFile(?string $contentUrl): void
    {
        if (! $contentUrl) {
            return;
        }

        if (str_starts_with($contentUrl, 'http://') || str_starts_with($contentUrl, 'https://')) {
            return;
        }

        Storage::disk('public')->delete($contentUrl);
    }

    private function materialResponse(Material $material): array
    {
        $material->loadMissing(['week.course']);

        $weekNumber = (int) $material->week->week_number;

        return [
            'id' => $material->id,
            'week_id' => $material->week_id,
            'course_id' => $material->week->course_id,
            'week_number' => $weekNumber,
            'week_title' => $material->week->title ?? 'Week ' . $weekNumber,
            'title' => $material->title,
            'type' => $this->normalizeMaterialTypeForResponse($material->type),
            'content_url' => $this->publicUrl($material->content_url),
            'created_at' => $material->created_at,
            'updated_at' => $material->updated_at,
        ];
    }

    private function normalizeMaterialTypeForDatabase(string $type): string
    {
        if ($type === 'video') {
            return 'video_link';
        }

        return $type;
    }

    private function normalizeMaterialTypeForResponse(string $type): string
    {
        if ($type === 'video_link') {
            return 'video_link';
        }

        return $type;
    }

    private function publicUrl(?string $contentUrl): ?string
    {
        if (! $contentUrl) {
            return null;
        }

        if (str_starts_with($contentUrl, 'http://') || str_starts_with($contentUrl, 'https://')) {
            return $contentUrl;
        }

        return Storage::disk('public')->url($contentUrl);
    }
}

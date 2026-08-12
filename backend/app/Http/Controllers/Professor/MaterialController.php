<?php

namespace App\Http\Controllers\Professor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Material;
use App\Models\Week;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class MaterialController extends Controller
{
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
            'week_number' => ['nullable', 'integer', 'min:1', 'max:52'],
        ]);

        $course = null;
        $weeks = collect();

        if (! empty($validated['course_id'])) {
            $course = $this->getOwnedCourse((int) $validated['course_id'], $request->user()->id);
            $this->ensureCourseWeeks($course);

            $weeks = Week::query()
                ->where('course_id', $course->id)
                ->when(! empty($validated['week_number']), function ($query) use ($validated) {
                    $query->where('week_number', (int) $validated['week_number']);
                })
                ->orderBy('week_number')
                ->get()
                ->map(fn (Week $week) => $this->weekResponse($week))
                ->values();
        }

        $materials = Material::query()
            ->with(['week.course'])
            ->whereHas('week.course', function ($query) use ($request) {
                $query->where('professor_id', $request->user()->id);
            })
            ->when($course, function ($query) use ($course) {
                $query->whereHas('week', function ($weekQuery) use ($course) {
                    $weekQuery->where('course_id', $course->id);
                });
            })
            ->when(! empty($validated['week_number']), function ($query) use ($validated) {
                $query->whereHas('week', function ($weekQuery) use ($validated) {
                    $weekQuery->where('week_number', (int) $validated['week_number']);
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
            'weeks' => $weeks,
        ]);
    }

    public function updateWeekAccess(Request $request, Course $course, int $week)
    {
        $this->ensureProfessor($request);

        $ownedCourse = $this->getOwnedCourse((int) $course->id, $request->user()->id);
        $this->ensureCourseWeeks($ownedCourse);

        $validated = $request->validate([
            'access_status' => ['required', Rule::in(['active', 'locked', 'scheduled'])],
            'unlock_at' => ['nullable', 'date', 'required_if:access_status,scheduled'],
        ]);

        $courseWeek = Week::query()
            ->where('course_id', $ownedCourse->id)
            ->where('week_number', $week)
            ->firstOrFail();

        $courseWeek->unlock_at = match ($validated['access_status']) {
            'active' => now(),
            'scheduled' => Carbon::parse(
                $validated['unlock_at'],
                config('app.timezone')
            ),
            default => null,
        };

        $courseWeek->save();

        return response()->json([
            'message' => match ($validated['access_status']) {
                'active' => 'Minggu berhasil diaktifkan.',
                'scheduled' => 'Jadwal akses minggu berhasil diperbarui.',
                default => 'Minggu berhasil dikunci.',
            },
            'week' => $this->weekResponse($courseWeek->fresh()),
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureProfessor($request);

        $validated = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'week_number' => ['required', 'integer', 'min:1', 'max:52'],
            'week_title' => ['nullable', 'string', 'max:255'],
            'unlock_at' => ['required', 'date'],
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in($this->requestTypes)],
            'content_url' => ['nullable', 'url', 'max:500'],
            'file' => ['nullable', 'file', 'max:204800'],
        ]);

        $course = $this->getOwnedCourse((int) $validated['course_id'], $request->user()->id);
        $weekNumber = (int) $validated['week_number'];

        $week = $this->resolveScheduledWeek(
            $course,
            $weekNumber,
            $validated['week_title'] ?? null,
            $validated['unlock_at']
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
            'week' => $this->weekResponse($week->fresh()),
        ], 201);
    }

    public function update(Request $request, Material $material)
    {
        $this->ensureProfessor($request);
        $this->ensureMaterialOwner($material, $request->user()->id);

        $validated = $request->validate([
            'course_id' => ['nullable', 'integer', 'exists:courses,id'],
            'week_number' => ['nullable', 'integer', 'min:1', 'max:52'],
            'week_title' => ['nullable', 'string', 'max:255'],
            'unlock_at' => ['nullable', 'date'],
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

        $week = $this->resolveScheduledWeek(
            $course,
            $weekNumber,
            $validated['week_title'] ?? $material->week->title,
            $validated['unlock_at'] ?? $material->week->unlock_at?->toISOString()
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
            'week' => $this->weekResponse($week->fresh()),
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

    private function ensureCourseWeeks(Course $course): void
    {
        $totalWeeks = max(1, (int) ($course->total_weeks ?? 17));

        for ($weekNumber = 1; $weekNumber <= $totalWeeks; $weekNumber++) {
            Week::firstOrCreate(
                [
                    'course_id' => $course->id,
                    'week_number' => $weekNumber,
                ],
                [
                    'title' => 'Week ' . $weekNumber,
                ]
            );
        }
    }

    private function resolveScheduledWeek(
        Course $course,
        int $weekNumber,
        ?string $weekTitle,
        string $unlockAt
    ): Week {
        $week = Week::firstOrNew([
            'course_id' => $course->id,
            'week_number' => $weekNumber,
        ]);

        if (! $week->exists || filled($weekTitle)) {
            $week->title = $weekTitle ?: 'Week ' . $weekNumber;
        }

        $week->unlock_at = Carbon::parse($unlockAt);
        $week->save();

        return $week;
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
            'unlock_at' => $material->week->unlock_at?->toISOString(),
            'is_accessible' => $material->week->is_accessible,
            'is_locked' => $material->week->is_locked,
            'title' => $material->title,
            'type' => $this->normalizeMaterialTypeForResponse($material->type),
            'content_url' => $this->publicUrl($material->content_url),
            'created_at' => $material->created_at,
            'updated_at' => $material->updated_at,
        ];
    }

    private function weekResponse(Week $week): array
    {
        return [
            'id' => (int) $week->id,
            'course_id' => (int) $week->course_id,
            'week_number' => (int) $week->week_number,
            'title' => $week->title ?: 'Week ' . $week->week_number,
            'unlock_at' => $week->unlock_at?->toISOString(),
            'due_at' => $week->due_at?->toISOString(),
            'is_accessible' => $week->is_accessible,
            'is_locked' => $week->is_locked,
            'access_status' => $this->weekAccessStatus($week),
        ];
    }

    private function weekAccessStatus(Week $week): string
    {
        if (! $week->unlock_at) {
            return 'locked';
        }

        if ($week->unlock_at->isFuture()) {
            return 'scheduled';
        }

        return 'active';
    }

    private function normalizeMaterialTypeForDatabase(string $type): string
    {
        return $type === 'video' ? 'video_link' : $type;
    }

    private function normalizeMaterialTypeForResponse(string $type): string
    {
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

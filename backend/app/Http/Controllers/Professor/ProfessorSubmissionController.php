<?php

namespace App\Http\Controllers\Professor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Professor\GradeSubmissionRequest;
use App\Http\Resources\Professor\ProfessorSubmissionResource;
use App\Models\Course;
use App\Models\Submission;
use App\Services\Professor\ProfessorSubmissionService;
use Illuminate\Http\Request;

class ProfessorSubmissionController extends Controller
{
    public function __construct(
        private readonly ProfessorSubmissionService $submissionService
    ) {
    }

    public function indexByWeek(Request $request, Course $course, int $week)
    {
        $submissions = $this->submissionService->getWeekSubmissions(
            $request->user(),
            $course,
            $week
        );

        return response()->json([
            'submissions' => ProfessorSubmissionResource::collection($submissions),
        ]);
    }

    public function grade(GradeSubmissionRequest $request, Submission $submission)
    {
        $gradedSubmission = $this->submissionService->gradeSubmission(
            $submission,
            $request->user(),
            $request->validated()
        );

        return response()->json([
            'message' => 'Nilai submission berhasil disimpan.',
            'submission' => new ProfessorSubmissionResource($gradedSubmission),
        ]);
    }
}

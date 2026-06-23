<?php

namespace App\Http\Resources\Professor;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfessorSubmissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $fileUrl = $this->file_url ?: $this->link_url ?: '#';
        $fileName = $fileUrl && $fileUrl !== '#'
            ? basename(parse_url($fileUrl, PHP_URL_PATH) ?: $fileUrl)
            : 'Submission Link';

        return [
            'id' => (string) $this->id,
            'assignmentId' => (string) $this->assignment_id,
            'studentId' => (int) $this->student_id,
            'studentName' => $this->student?->name ?? 'Unknown Student',
            'nim' => $this->student?->nim ?? '-',
            'class_' => $this->student?->class_ ?? '-',
            'fileName' => $fileName,
            'fileUrl' => $fileUrl,
            'submittedAt' => $this->submitted_at?->toDateString() ?? $this->created_at?->toDateString() ?? '-',
            'score' => $this->score,
            'feedback' => $this->feedback,
            'gradedAt' => $this->graded_at?->toDateTimeString(),
            'gradedBy' => $this->graded_by,
            'status' => $this->status ?? 'submitted',
        ];
    }
}

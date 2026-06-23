<?php

namespace App\Http\Requests\Professor;

use App\Models\Submission;
use Illuminate\Foundation\Http\FormRequest;

class GradeSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if (! $user || $user->role !== 'professor') {
            return false;
        }

        $submission = $this->route('submission');

        if (! $submission instanceof Submission) {
            return false;
        }

        $submission->loadMissing(['assignment.week.course']);

        return (int) $submission->assignment?->week?->course?->professor_id === (int) $user->id;
    }

    public function rules(): array
    {
        return [
            'score' => ['required', 'integer', 'min:0', 'max:100'],
            'feedback' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'score.required' => 'Nilai wajib diisi.',
            'score.integer' => 'Nilai harus berupa angka.',
            'score.min' => 'Nilai minimal adalah 0.',
            'score.max' => 'Nilai maksimal adalah 100.',
        ];
    }
}

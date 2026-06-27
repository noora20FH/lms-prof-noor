<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Week;

class WeekPolicy
{
    public function view(User $user, Week $week): bool
    {
        $isEnrolled = $week->course
            ->enrollments()
            ->where('student_id', $user->id)
            ->where('status', 'approved')
            ->exists();

        if (!$isEnrolled) {
            return false;
        }

        if (!$week->unlock_at) {
            return false;
        }

        return $week->unlock_at->lte(now());
    }
}

<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = ['name', 'email', 'password', 'role'];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = ['email_verified_at' => 'datetime'];

    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    public function courses() // sebagai professor
    {
        return $this->hasMany(Course::class, 'professor_id');
    }

    public function enrollments()
    {
        return $this->hasMany(CourseEnrollment::class);
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class, 'student_id');
    }
}

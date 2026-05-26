<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Kolom yang boleh diisi massal
     */
    protected $fillable = [
        'name',
        'email',
        'nim',        // ← tambahkan
        'class_',     // ← tambahkan (atau 'kelas' sesuai nama kolom)

        'password',
        'role',
    ];

    /**
     * Kolom yang disembunyikan saat di-json
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Casting tipe data
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',        // ← Rekomendasi Laravel 10/11
    ];

    // ========================================
    // RELATIONSHIPS
    // ========================================

    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    // Sebagai Professor
    public function courses()
    {
        return $this->hasMany(Course::class, 'professor_id');
    }

    // Sebagai Student
    public function enrollments()
    {
        return $this->hasMany(CourseEnrollment::class, 'student_id');
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class, 'student_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Week extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'week_number',
        'title',
        'description',
        'unlock_at',
        'due_at',
    ];

    protected $casts = [
        'week_number' => 'integer',
        'unlock_at' => 'datetime',
        'due_at' => 'datetime',
    ];

    protected $appends = [
        'is_accessible',
        'is_locked',
    ];

    /**
     * Mata kuliah pemilik week.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    /**
     * Daftar materi pada week.
     */
    public function materials(): HasMany
    {
        return $this->hasMany(Material::class, 'week_id');
    }

    /**
     * Daftar tugas pada week.
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class, 'week_id');
    }

    public function getIsAccessibleAttribute(): bool
    {
        if (! $this->unlock_at) {
            return false;
        }

        return $this->unlock_at->lte(now());
    }

    public function getIsLockedAttribute(): bool
    {
        return ! $this->is_accessible;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'week_id',
        'title',
        'description',
        'file_url',
        'gdrive_submission_link',
        'submission_note',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    public function week()
    {
        return $this->belongsTo(Week::class);
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }
}

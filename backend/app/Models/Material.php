<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    use HasFactory;

    protected $fillable = ['week_id', 'title', 'type', 'content_url'];

    public function week()
    {
        return $this->belongsTo(Week::class);
    }
}

<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment('Build, learn, and improve.');
})->purpose('Display an inspirational message');

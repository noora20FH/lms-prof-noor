<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * Routes yang dikecualikan dari CSRF protection
     */
    protected $except = [
        'api/*',           // ← ini yang bikin 419 hilang
        'sanctum/csrf-cookie',
    ];
}

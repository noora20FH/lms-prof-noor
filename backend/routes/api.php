<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Professor\ProfessorCourseController;
use App\Http\Controllers\Professor\ProfessorAssignmentController;
use App\Http\Controllers\Professor\ProfessorSubmissionController;
use App\Http\Controllers\Professor\MaterialController;

// ==================== AUTH PUBLIC ====================
Route::post('/register', [RegisterController::class, 'register']);

Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->name('login');

// ==================== AUTH PROTECTED ====================
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user()->only([
            'id',
            'name',
            'email',
            'nim',
            'class_',
            'role',
        ]);
    });

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

    Route::prefix('professor')->group(function () {
        // Courses CRUD
        Route::get('/courses', [ProfessorCourseController::class, 'index']);
        Route::post('/courses', [ProfessorCourseController::class, 'store']);
        Route::get('/courses/{course}', [ProfessorCourseController::class, 'show']);
        Route::put('/courses/{course}', [ProfessorCourseController::class, 'update']);
        Route::patch('/courses/{course}', [ProfessorCourseController::class, 'update']);
        Route::delete('/courses/{course}', [ProfessorCourseController::class, 'destroy']);
        Route::get('/courses/{course}/details', [ProfessorCourseController::class, 'details']);

        // Assignments per week
        Route::get('/courses/{course}/weeks/{week}', [ProfessorAssignmentController::class, 'week']);
        Route::get('/courses/{course}/weeks/{week}/assignments', [ProfessorAssignmentController::class, 'indexByWeek']);
        Route::post('/courses/{course}/weeks/{week}/assignments', [ProfessorAssignmentController::class, 'store']);
        Route::put('/assignments/{assignment}', [ProfessorAssignmentController::class, 'update']);
        Route::patch('/assignments/{assignment}', [ProfessorAssignmentController::class, 'update']);
        Route::delete('/assignments/{assignment}', [ProfessorAssignmentController::class, 'destroy']);

        // Submissions and grading
        Route::get('/courses/{course}/weeks/{week}/submissions', [ProfessorSubmissionController::class, 'indexByWeek']);
        Route::put('/submissions/{submission}/grade', [ProfessorSubmissionController::class, 'grade']);
        Route::patch('/submissions/{submission}/grade', [ProfessorSubmissionController::class, 'grade']);

        // Materials routes from the previous materials CRUD feature.
        Route::get('/materials', [MaterialController::class, 'index']);
        Route::post('/materials', [MaterialController::class, 'store']);
        Route::post('/materials/{material}', [MaterialController::class, 'update']);
        Route::put('/materials/{material}', [MaterialController::class, 'update']);
        Route::patch('/materials/{material}', [MaterialController::class, 'update']);
        Route::delete('/materials/{material}', [MaterialController::class, 'destroy']);
    });


    Route::prefix('professor/students')
    ->middleware('auth:sanctum')
    ->group(function () {
        Route::get('/', [App\Http\Controllers\Professor\StudentController::class, 'index']);
        Route::get('/available', [App\Http\Controllers\Professor\StudentController::class, 'availableStudents']);
    Route::post('/enroll', [App\Http\Controllers\Professor\StudentController::class, 'enroll']);
    Route::post('/{enrollmentId}/approve', [App\Http\Controllers\Professor\StudentController::class, 'approve']);
    Route::delete('/{enrollmentId}', [App\Http\Controllers\Professor\StudentController::class, 'reject']);
    });
});

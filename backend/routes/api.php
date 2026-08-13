<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Professor\ProfessorCourseController;
use App\Http\Controllers\Professor\ProfessorAssignmentController;
use App\Http\Controllers\Professor\ProfessorSubmissionController;
use App\Http\Controllers\Professor\MaterialController;
use App\Http\Controllers\Professor\StudentController;
use App\Http\Controllers\Professor\ProfessorDashboardController;
use App\Http\Controllers\Api\Student\StudentCourseController;
use App\Http\Controllers\Api\Student\CourseWeekController;
use App\Http\Controllers\Api\Student\MaterialAccessController;
use App\Http\Controllers\Api\Student\StudentSubmissionController;
use App\Http\Controllers\Api\Student\StudentDashboardController;
use App\Http\Controllers\Api\Student\AssignmentController;
use App\Http\Controllers\Api\ProfileController;

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
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::patch('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

    Route::prefix('professor')->group(function () {
        // Dashboard database summary
        Route::get('/dashboard', [ProfessorDashboardController::class, 'index']);

        // Courses CRUD
        Route::get('/courses', [ProfessorCourseController::class, 'index']);
        Route::post('/courses', [ProfessorCourseController::class, 'store']);
        Route::get('/courses/{course}', [ProfessorCourseController::class, 'show']);
        Route::put('/courses/{course}', [ProfessorCourseController::class, 'update']);
        Route::patch('/courses/{course}', [ProfessorCourseController::class, 'update']);
        Route::delete(
            '/courses/{course}',
            [ProfessorCourseController::class, 'destroy']
        );
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
        Route::patch(
            '/courses/{course}/weeks/{week}/access',
            [MaterialController::class, 'updateWeekAccess']
        );

        Route::get('/materials', [MaterialController::class, 'index']);
        Route::post('/materials', [MaterialController::class, 'store']);
        Route::post('/materials/{material}', [MaterialController::class, 'update']);
        Route::put('/materials/{material}', [MaterialController::class, 'update']);
        Route::patch('/materials/{material}', [MaterialController::class, 'update']);
        Route::delete('/materials/{material}', [MaterialController::class, 'destroy']);
    });



    Route::prefix('student')->group(function () {
        Route::get('/dashboard', [StudentDashboardController::class, 'index']);
        Route::get('/courses', [StudentCourseController::class, 'index']);
        Route::post('/courses/{course}/enrollment', [StudentCourseController::class, 'store']);
        Route::put('/courses/{course}/enrollment', [StudentCourseController::class, 'update']);
        Route::patch('/courses/{course}/enrollment', [StudentCourseController::class, 'update']);
        Route::delete('/courses/{course}/enrollment', [StudentCourseController::class, 'destroy']);
        Route::get('/courses/{course}/weeks', [CourseWeekController::class, 'index']);
        Route::get('/courses/{course}/weeks/{week}', [CourseWeekController::class, 'show']);
        Route::get('/materials/{material}/open', [MaterialAccessController::class, 'open'])
            ->name('student.materials.open');
        Route::post('/assignments/{assignment}/submission', [StudentSubmissionController::class, 'store']);
        Route::get('/assignments', [AssignmentController::class, 'index']);
    });

    Route::prefix('professor/students')->group(function () {
        Route::get('/', [StudentController::class, 'index']);
        Route::get('/available', [StudentController::class, 'availableStudents']);
        Route::get('/trashed', [StudentController::class, 'trashed']);
        Route::post('/enroll', [StudentController::class, 'enroll']);
        Route::get('/{enrollmentId}', [StudentController::class, 'show']);
        Route::put('/{enrollmentId}', [StudentController::class, 'update']);
        Route::patch('/{enrollmentId}', [StudentController::class, 'update']);
        Route::post('/{enrollmentId}/approve', [StudentController::class, 'approve']);
        Route::patch('/{enrollmentId}/restore', [StudentController::class, 'restore']);
        Route::delete('/{enrollmentId}', [StudentController::class, 'destroy']);
    });
});

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_enrollments', function (Blueprint $table) {
            // Tambah created_at & updated_at jika belum ada
            if (!Schema::hasColumn('course_enrollments', 'created_at')) {
                $table->timestamps();
            }

            // Tambah deleted_at untuk Soft Deletes
            if (!Schema::hasColumn('course_enrollments', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    public function down(): void
    {
        Schema::table('course_enrollments', function (Blueprint $table) {
            if (Schema::hasColumn('course_enrollments', 'deleted_at')) {
                $table->dropSoftDeletes();
            }

            if (Schema::hasColumn('course_enrollments', 'created_at')) {
                $table->dropTimestamps();
            }
        });
    }
};

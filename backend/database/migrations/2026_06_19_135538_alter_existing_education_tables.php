<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. ALTER TABLE COURSES
        if (Schema::hasTable('courses')) {
            Schema::table('courses', function (Blueprint $table) {
                // Jika sebelumnya belum ada Primary Key 'id', tambahkan (Opsional tergantung DB saat ini)
                if (!Schema::hasColumn('courses', 'id')) {
                    $table->id()->first();
                }

                // Memastikan kolom pendukung ada dan tipenya sesuai
                if (!Schema::hasColumn('courses', 'status')) {
                    $table->enum('status', ['active', 'disabled'])->default('active');
                }
                if (!Schema::hasColumn('courses', 'capacity')) {
                    $table->unsignedInteger('capacity')->default(50);
                }
                if (!Schema::hasColumn('courses', 'total_weeks')) {
                    $table->unsignedInteger('total_weeks')->default(17);
                }
            });
        }

        // 2. ALTER TABLE WEEKS
        if (Schema::hasTable('weeks')) {
            Schema::table('weeks', function (Blueprint $table) {
                if (!Schema::hasColumn('weeks', 'id')) {
                    $table->id()->first();
                }

                // Pastikan unique constraint dipasang jika belum ada
                // Menggunakan try-catch agar tidak error jika index sudah ada
                try {
                    $table->unique(['course_id', 'week_number']);
                } catch (\Exception $e) {
                    // Index sudah ada, abaikan
                }
            });
        }

        // 3. ALTER TABLE COURSE_ENROLLMENTS
        if (Schema::hasTable('course_enrollments')) {
            Schema::table('course_enrollments', function (Blueprint $table) {
                if (!Schema::hasColumn('course_enrollments', 'id')) {
                    $table->id()->first();
                }

                // Jika sebelumnya nama kolomnya adalah 'user_id' dan ingin diubah ke 'student_id'
                if (Schema::hasColumn('course_enrollments', 'user_id') && !Schema::hasColumn('course_enrollments', 'student_id')) {
                    $table->renameColumn('user_id', 'student_id');
                }

                try {
                    $table->unique(['student_id', 'course_id']);
                } catch (\Exception $e) {
                    // Index sudah ada, abaikan
                }
            });
        }

        // 4. ALTER TABLE MATERIALS
        if (Schema::hasTable('materials')) {
            Schema::table('materials', function (Blueprint $table) {
                if (!Schema::hasColumn('materials', 'id')) {
                    $table->id()->first();
                }

                // Mengubah panjang karakter content_url menjadi 500 jika sebelumnya default (255)
                $table->string('content_url', 500)->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Karena ini migrasi alter untuk mempertahankan data,
        // disarankan tidak melakukan drop table di method down agar data aman jika ter-rollback.
    }
};

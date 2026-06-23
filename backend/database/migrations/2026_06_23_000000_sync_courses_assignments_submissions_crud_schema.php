<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('courses')) {
            Schema::table('courses', function (Blueprint $table) {
                if (! Schema::hasColumn('courses', 'id')) {
                    $table->id()->first();
                }

                if (! Schema::hasColumn('courses', 'code')) {
                    $table->string('code', 50)->nullable()->unique()->after('title');
                }

                if (! Schema::hasColumn('courses', 'status')) {
                    $table->enum('status', ['active', 'disabled'])->default('active')->after('description');
                }

                if (! Schema::hasColumn('courses', 'capacity')) {
                    $table->unsignedInteger('capacity')->default(50)->after('status');
                }

                if (! Schema::hasColumn('courses', 'total_weeks')) {
                    $table->unsignedInteger('total_weeks')->default(17)->after('capacity');
                }

                if (! Schema::hasColumn('courses', 'created_at') && ! Schema::hasColumn('courses', 'updated_at')) {
                    $table->timestamps();
                }
            });
        }

        if (Schema::hasTable('weeks')) {
            Schema::table('weeks', function (Blueprint $table) {
                if (! Schema::hasColumn('weeks', 'title')) {
                    $table->string('title')->nullable()->after('week_number');
                }
            });

            DB::table('weeks')
                ->whereNull('title')
                ->orderBy('id')
                ->get(['id', 'week_number'])
                ->each(function ($week) {
                    DB::table('weeks')
                        ->where('id', $week->id)
                        ->update(['title' => 'Week ' . $week->week_number]);
                });
        }

        if (Schema::hasTable('assignments')) {
            Schema::table('assignments', function (Blueprint $table) {
                if (! Schema::hasColumn('assignments', 'gdrive_submission_link')) {
                    $table->string('gdrive_submission_link', 500)->nullable()->after('file_url');
                }

                if (! Schema::hasColumn('assignments', 'submission_note')) {
                    $table->text('submission_note')->nullable()->after('gdrive_submission_link');
                }
            });

            DB::table('assignments')
                ->whereNull('gdrive_submission_link')
                ->whereNotNull('file_url')
                ->update(['gdrive_submission_link' => DB::raw('file_url')]);
        }

        if (Schema::hasTable('submissions')) {
            Schema::table('submissions', function (Blueprint $table) {
                if (! Schema::hasColumn('submissions', 'score')) {
                    $table->integer('score')->nullable()->after('submitted_at');
                }

                if (! Schema::hasColumn('submissions', 'feedback')) {
                    $table->text('feedback')->nullable()->after('score');
                }

                if (! Schema::hasColumn('submissions', 'graded_at')) {
                    $table->timestamp('graded_at')->nullable()->after('feedback');
                }

                if (! Schema::hasColumn('submissions', 'graded_by')) {
                    $table->foreignId('graded_by')->nullable()->after('graded_at')->constrained('users')->nullOnDelete();
                }

                if (! Schema::hasColumn('submissions', 'status')) {
                    $table->enum('status', ['submitted', 'graded'])->default('submitted')->after('graded_by');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('submissions')) {
            Schema::table('submissions', function (Blueprint $table) {
                if (Schema::hasColumn('submissions', 'graded_by')) {
                    $table->dropConstrainedForeignId('graded_by');
                }

                foreach (['status', 'graded_at', 'feedback', 'score'] as $column) {
                    if (Schema::hasColumn('submissions', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }

        if (Schema::hasTable('assignments')) {
            Schema::table('assignments', function (Blueprint $table) {
                foreach (['submission_note', 'gdrive_submission_link'] as $column) {
                    if (Schema::hasColumn('assignments', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            if (! Schema::hasColumn('courses', 'code')) {
                $table->string('code', 50)->nullable()->unique()->after('title');
            }

            if (! Schema::hasColumn('courses', 'status')) {
                $table->enum('status', ['active', 'disabled'])->default('active')->after('description');
            }

            if (! Schema::hasColumn('courses', 'capacity')) {
                $table->integer('capacity')->default(50)->after('status');
            }

            if (! Schema::hasColumn('courses', 'total_weeks')) {
                $table->integer('total_weeks')->default(17)->after('capacity');
            }

            if (! Schema::hasColumn('courses', 'created_at') && ! Schema::hasColumn('courses', 'updated_at')) {
                $table->timestamps();
            } elseif (! Schema::hasColumn('courses', 'created_at')) {
                $table->timestamp('created_at')->nullable();
            } elseif (! Schema::hasColumn('courses', 'updated_at')) {
                $table->timestamp('updated_at')->nullable();
            }
        });

        if (Schema::hasColumn('courses', 'created_at') && Schema::hasColumn('courses', 'updated_at')) {
            DB::table('courses')
                ->whereNull('created_at')
                ->orWhereNull('updated_at')
                ->update([
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
        }

        Schema::table('weeks', function (Blueprint $table) {
            if (! Schema::hasColumn('weeks', 'title')) {
                $table->string('title')->nullable()->after('week_number');
            }
        });

        if (Schema::hasColumn('weeks', 'title')) {
            DB::table('weeks')
                ->whereNull('title')
                ->orderBy('id')
                ->get(['id', 'week_number'])
                ->each(function ($week) {
                    DB::table('weeks')
                        ->where('id', $week->id)
                        ->update([
                            'title' => 'Week ' . $week->week_number,
                        ]);
                });
        }

        $this->mergeDuplicateWeeks();

        if (! $this->indexExists('weeks', 'weeks_course_id_week_number_unique')) {
            Schema::table('weeks', function (Blueprint $table) {
                $table->unique(['course_id', 'week_number'], 'weeks_course_id_week_number_unique');
            });
        }

        DB::statement("ALTER TABLE materials MODIFY type ENUM('pdf', 'ppt', 'video_link', 'yt_link') NOT NULL");
        DB::statement("ALTER TABLE materials MODIFY content_url VARCHAR(500) NOT NULL");
    }

    public function down(): void
    {
        if ($this->indexExists('weeks', 'weeks_course_id_week_number_unique')) {
            Schema::table('weeks', function (Blueprint $table) {
                $table->dropUnique('weeks_course_id_week_number_unique');
            });
        }

        if (Schema::hasColumn('weeks', 'title')) {
            Schema::table('weeks', function (Blueprint $table) {
                $table->dropColumn('title');
            });
        }

        Schema::table('courses', function (Blueprint $table) {
            if (Schema::hasColumn('courses', 'code')) {
                $table->dropUnique(['code']);
                $table->dropColumn('code');
            }

            if (Schema::hasColumn('courses', 'status')) {
                $table->dropColumn('status');
            }

            if (Schema::hasColumn('courses', 'capacity')) {
                $table->dropColumn('capacity');
            }

            if (Schema::hasColumn('courses', 'total_weeks')) {
                $table->dropColumn('total_weeks');
            }
        });

        DB::statement("ALTER TABLE materials MODIFY type ENUM('pdf', 'ppt', 'video_link', 'yt_link') NOT NULL");
        DB::statement("ALTER TABLE materials MODIFY content_url VARCHAR(255) NOT NULL");
    }

    private function mergeDuplicateWeeks(): void
    {
        $duplicateGroups = DB::table('weeks')
            ->select('course_id', 'week_number', DB::raw('MIN(id) as keep_id'), DB::raw('COUNT(*) as total'))
            ->groupBy('course_id', 'week_number')
            ->having('total', '>', 1)
            ->get();

        foreach ($duplicateGroups as $group) {
            $duplicateIds = DB::table('weeks')
                ->where('course_id', $group->course_id)
                ->where('week_number', $group->week_number)
                ->where('id', '<>', $group->keep_id)
                ->pluck('id')
                ->all();

            if (empty($duplicateIds)) {
                continue;
            }

            DB::table('materials')
                ->whereIn('week_id', $duplicateIds)
                ->update(['week_id' => $group->keep_id]);

            if (Schema::hasTable('assignments')) {
                DB::table('assignments')
                    ->whereIn('week_id', $duplicateIds)
                    ->update(['week_id' => $group->keep_id]);
            }

            DB::table('weeks')
                ->whereIn('id', $duplicateIds)
                ->delete();
        }
    }

    private function indexExists(string $table, string $index): bool
    {
        $result = DB::selectOne(
            'SELECT COUNT(*) as total FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?',
            [$table, $index]
        );

        return (int) ($result->total ?? 0) > 0;
    }
};

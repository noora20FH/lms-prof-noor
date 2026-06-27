<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('weeks', function (Blueprint $table) {
            if (! Schema::hasColumn('weeks', 'unlock_at')) {
                $table->timestamp('unlock_at')
                    ->nullable()
                    ->after('week_number');
            }

            if (! Schema::hasColumn('weeks', 'due_at')) {
                $table->timestamp('due_at')
                    ->nullable()
                    ->after('unlock_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('weeks', function (Blueprint $table) {
            $columns = [];

            if (Schema::hasColumn('weeks', 'unlock_at')) {
                $columns[] = 'unlock_at';
            }

            if (Schema::hasColumn('weeks', 'due_at')) {
                $columns[] = 'due_at';
            }

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};

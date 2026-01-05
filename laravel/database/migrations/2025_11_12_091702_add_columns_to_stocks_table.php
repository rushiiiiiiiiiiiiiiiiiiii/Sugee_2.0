<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            if (!Schema::hasColumn('stocks', 'from_site_id')) {
                $table->unsignedBigInteger('from_site_id')->nullable()->after('site_id');
            }

            if (!Schema::hasColumn('stocks', 'to_site_id')) {
                $table->unsignedBigInteger('to_site_id')->nullable()->after('from_site_id');
            }

            if (!Schema::hasColumn('stocks', 'transfer_status')) {
                $table->string('transfer_status')->nullable()->after('to_site_id');
            }

            if (!Schema::hasColumn('stocks', 'transfer_date')) {
                $table->timestamp('transfer_date')->nullable()->after('transfer_status');
            }

            // Optional: add foreign keys for referential integrity
            $table->foreign('from_site_id')->references('id')->on('sites')->onDelete('set null');
            $table->foreign('to_site_id')->references('id')->on('sites')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            if (Schema::hasColumn('stocks', 'from_site_id')) {
                $table->dropForeign(['from_site_id']);
                $table->dropColumn('from_site_id');
            }
            if (Schema::hasColumn('stocks', 'to_site_id')) {
                $table->dropForeign(['to_site_id']);
                $table->dropColumn('to_site_id');
            }
            if (Schema::hasColumn('stocks', 'transfer_status')) {
                $table->dropColumn('transfer_status');
            }
            if (Schema::hasColumn('stocks', 'transfer_date')) {
                $table->dropColumn('transfer_date');
            }                                                                                                                                                                                                                                                                                                                                                                                                                                         
        });
    }
};

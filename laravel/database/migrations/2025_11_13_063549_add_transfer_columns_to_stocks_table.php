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
                $table->unsignedBigInteger('from_site_id')->nullable()->after('product_id');
                $table->foreign('from_site_id')
                      ->references('id')
                      ->on('site')
                      ->onDelete('set null');
            }

            if (!Schema::hasColumn('stocks', 'to_site_id')) {
                $table->unsignedBigInteger('to_site_id')->nullable()->after('from_site_id');
                $table->foreign('to_site_id')
                      ->references('id')
                      ->on('site')
                      ->onDelete('set null');
            }
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
        });
    }
};

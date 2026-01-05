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
        Schema::create('outward_transaction', function (Blueprint $table) {
            $table->id();
            $table->integer('product_id');
            $table->integer('site_id');
            $table->integer('quantity');
            $table->integer('request_id');
            $table->string('type')->default('manual');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('outward_transaction');
    }
};

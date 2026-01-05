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
        Schema::create('products_sepcification', function (Blueprint $table) {
            $table->id();
            $table->string("spec_1")->nullable();
            $table->string("spec_2")->nullable();
            $table->string("spec_3")->nullable();
            $table->string("spec_4")->nullable();
            $table->string("desc")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products_sepcification');
    }
};

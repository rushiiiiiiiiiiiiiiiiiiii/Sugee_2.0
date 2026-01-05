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
        Schema::create('assign_items', function (Blueprint $table) {
            $table->id();
            $table->integer("product_id");
            $table->integer("site_id");
            $table->integer("quantity");
            $table->string("expected_delivery");
            $table->string("notes")->nullable();
            $table->string("dispatched_qty")->nullable();
            $table->string("status")->default("pending");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assign_items');
    }
};

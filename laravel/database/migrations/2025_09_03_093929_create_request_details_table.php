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
        Schema::create('request_details', function (Blueprint $table) {
            $table->id();
            $table->Integer('site_id');
            $table->Integer('product_request_id');
            $table->Integer('received_qty')->nullable();
            $table->Integer('issued_qty');
            $table->Integer('dispatched_qty')->nullable()->default(0);
            $table->Integer('return_qty')->nullable();
            $table->String('remark');
            $table->String('urgency')->nullable();
            $table->date('deliveryDate')->nullable();
            $table->String('status')->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_details');
    }
};

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
        Schema::create('purchase', function (Blueprint $table) {
            $table->id();
            $table->string("supplier");
            $table->string("category");
            $table->string("sub_category");
            $table->string("product_name");
            $table->integer("quantity");
            $table->integer('received_qty')->default(0)->after('quantity');
            $table->string("expected_delivery");
            $table->string("notes")->nullable();
            // $table->string("price");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase');
    }
};

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
        Schema::create('psgc_mun', function (Blueprint $table) {
            $table->integer('psgc_reg');
            $table->integer('psgc_prov');
            $table->integer('psgc_mun')->primary();
            $table->string('mun_name');
            $table->timestamps();

            $table->foreign('psgc_reg')->references('psgc_reg')->on('psgc_reg');
            $table->foreign('psgc_prov')->references('psgc_prov')->on('psgc_prov');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('psgc_mun');
    }
};

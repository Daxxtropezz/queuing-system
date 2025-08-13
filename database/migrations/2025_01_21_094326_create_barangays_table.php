<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('psgc_brgy', function (Blueprint $table) {
            $table->integer('psgc_reg');
            $table->integer('psgc_prov');
            $table->integer('psgc_mun');
            $table->integer('psgc_brgy')->primary();
            $table->string('brgy_name');
            $table->timestamps();

            $table->foreign('psgc_reg')
                ->references('psgc_reg')
                ->on('psgc_reg')
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->foreign('psgc_prov')
                ->references('psgc_prov')
                ->on('psgc_prov')
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->foreign('psgc_mun')
                ->references('psgc_mun')
                ->on('psgc_mun')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('psgc_code', function (Blueprint $table) {
            $table->integer('psgc_reg');
            $table->integer('psgc_prov');
            $table->integer('psgc_mun');
            $table->integer('psgc_brgy');
            $table->timestamps();

            $table->foreign('psgc_reg')
                ->references('psgc_reg')
                ->on('psgc_reg')
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->foreign('psgc_prov')
                ->references('psgc_prov')
                ->on('psgc_prov')
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->foreign('psgc_mun')
                ->references('psgc_mun')
                ->on('psgc_mun')
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->foreign('psgc_brgy')
                ->references('psgc_brgy')
                ->on('psgc_brgy')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('psgc_brgy');
        Schema::dropIfExists('psgc_code');
    }
};

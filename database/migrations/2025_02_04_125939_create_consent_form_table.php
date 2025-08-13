<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_consent_form', function (Blueprint $table) {
            $table->string('incident_no', 3)->primary();
            $table->string('client_name')->nullable();
            $table->string('path_to_esign')->nullable();
            $table->date('date_signed')->nullable();
            $table->string('reason_of_refusal', 2500)->nullable();
            $table->string('client_code', 20)->nullable();
            $table->timestamps();

            $table->foreign('client_code')
                ->references('client_code')
                ->on('tbl_victim_info');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_consent_form');
    }
};

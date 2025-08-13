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
        Schema::create('tbl_bpo_application', function (Blueprint $table) {
            $table->id('bpo_application_id')->primary();
            $table->string('client_code');
            $table->boolean('is_victim');
            $table->string('relationship');
            $table->string('applicant_name');
            $table->date('birthdate');
            $table->string('contact_no');
            $table->string('occupation');
            $table->string('civil_status');
            $table->string('address');
            $table->timestamps();

            $table->foreign('client_code')
                ->references('client_code')
                ->on('tbl_victim_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_bpo_child', function (Blueprint $table) {
            $table->id('bpo_child_id')->primary();
            $table->unsignedBigInteger('bpo_application_id');
            $table->boolean('is_child');
            $table->string('last_name');
            $table->string('first_name');
            $table->string('middle_name');
            $table->string('ext');
            $table->date('birthdate');
            $table->string('contact_no');
            $table->timestamps();

            $table->foreign('bpo_application_id')
                ->references('bpo_application_id')
                ->on('tbl_bpo_application')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_bpo_respondent', function (Blueprint $table) {
            $table->id('respondent_id')->primary();
            $table->unsignedBigInteger('bpo_application_id');
            $table->string('last_name');
            $table->string('first_name');
            $table->string('middle_name');
            $table->string('ext');
            $table->string('sex');
            $table->string('contact_no');
            $table->string('occupation');
            $table->string('civil_status');
            $table->date('birthdate');
            $table->string('relationship');
            $table->timestamps();

            $table->foreign('bpo_application_id')
                ->references('bpo_application_id')
                ->on('tbl_bpo_application')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_bpo_complaint', function (Blueprint $table) {
            $table->id('complaint_id')->primary();
            $table->unsignedBigInteger('bpo_application_id');
            $table->string('acts_complained');
            $table->date('commission_date');
            $table->string('commission_place');
            $table->string('circumstance_state');
            $table->string('applicant_victim');
            $table->string('barangay_captain');;
            $table->timestamps();

            $table->foreign('bpo_application_id')
                ->references('bpo_application_id')
                ->on('tbl_bpo_application')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

    }

    

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_bpo_application');
        Schema::dropIfExists('tbl_bpo_child');
        Schema::dropIfExists('tbl_bpo_respondent');
        Schema::dropIfExists('tbl_bpo_complaint');
    }
};

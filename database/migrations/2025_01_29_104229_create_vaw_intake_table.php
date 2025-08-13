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
        Schema::create('tbl_incident_info', function (Blueprint $table) {
            $table->string('incident_no')->primary();
            $table->string('violence_type');
            $table->string('violence_subcategory');
            $table->string('violence_other_type');
            $table->string('incident_details');
            $table->date('date_reported');
            $table->date('incident_date');
            $table->time('incident_time');
            $table->string('incident_place_type');
            $table->boolean('is_perpetuated_electronic');
            $table->boolean('is_harmful_practice');
            $table->boolean('is_conflict_area');
            $table->boolean('is_calamity_area');
            $table->timestamps();
        });

        Schema::create('tbl_victim_info', function (Blueprint $table) {
            $table->string('client_code')->primary();
            $table->string('last_name')->nullable();
            $table->string('first_name')->nullable();
            $table->string('middle_name')->nullable();
            $table->string('extension')->nullable();
            $table->string('nick_name')->nullable();
            $table->string('sex')->nullable();
            $table->boolean('is_sogie')->nullable();
            $table->string('sogie_spec')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('minor_status')->nullable();
            $table->string('civil_status')->nullable();
            $table->string('educational_attainment')->nullable();
            $table->string('nationality')->nullable();
            $table->string('ethnicity')->nullable();
            $table->string('occupation')->nullable();
            $table->double('salary')->nullable();
            $table->string('employment_status')->nullable();
            $table->string('religion')->nullable();
            $table->string('is_internally_displaced')->nullable();
            $table->string('is_pwd')->nullable();
            $table->string('contact_info', 15)->nullable();
            $table->timestamps();
        });

        Schema::create('tbl_incident_client', function (Blueprint $table) {
            $table->string('incident_no')->unique();
            $table->string('client_code')->unique();
            $table->timestamps();

            $table->foreign('incident_no')
                ->references('incident_no')
                ->on('tbl_incident_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('client_code')
                ->references('client_code')
                ->on('tbl_victim_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_victim_birthplace', function (Blueprint $table) {
            $table->increments('victim_birthplace_id')->primary();
            $table->string('client_code');
            $table->integer('region');
            $table->integer('province');
            $table->integer('citymuns');
            $table->integer('barangay');
            $table->timestamps();

            $table->foreign('barangay')
                ->references('psgc_brgy')
                ->on('psgc_brgy')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('client_code')
                ->references('client_code')
                ->on('tbl_victim_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_victim_employment', function (Blueprint $table) {
            $table->increments('victim_employment_id')->primary();
            $table->string('client_code');
            $table->string('occupation');
            $table->double('gross_income');
            $table->string('employment_status');
            $table->string('migratory_status');
            $table->timestamps();

            $table->foreign('client_code')
                ->references('client_code')
                ->on('tbl_victim_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_victim_address', function (Blueprint $table) {
            $table->increments('victim_address_id')->primary();
            $table->string('client_code');
            $table->boolean('is_homeless');
            $table->integer('region');
            $table->integer('province');
            $table->integer('citymuns');
            $table->integer('barangay');
            $table->string('street');
            $table->integer('house_no');
            $table->timestamps();

            $table->foreign('client_code')
                ->references('client_code')
                ->on('tbl_victim_info');

            $table->foreign('barangay')
                ->references('psgc_brgy')
                ->on('psgc_brgy');
        });

        Schema::create('tbl_administrative_info', function (Blueprint $table) {
            $table->increments('admin_info_id')->primary();
            $table->string('client_code');
            $table->string('incident_no');
            $table->unsignedBigInteger('user_id');
            $table->string('lastname');
            $table->string('firstname');
            $table->string('middlename');
            $table->string('ext');
            $table->string('position');
            $table->string('organization');
            $table->string('office_address');
            $table->string('informant_name');
            $table->string('relationship');
            $table->string('contact_no');
            $table->timestamps();

            $table->foreign('client_code')
                ->references('client_code')
                ->on('tbl_incident_client')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_incident_location', function (Blueprint $table) {
            $table->increments('incident_location_id')->primary();
            $table->string('incident_no');
            $table->integer('region');
            $table->integer('province');
            $table->integer('citymuns');
            $table->integer('barangay');
            $table->timestamps();

            $table->foreign('incident_no')
                ->references('incident_no')
                ->on('tbl_incident_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('barangay')
                ->references('psgc_brgy')
                ->on('psgc_brgy')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_perpetrator_info', function (Blueprint $table) {
            $table->increments('perpetrator_id')->primary();
            $table->string('client_code');
            $table->string('incident_no');
            $table->string('last_name');
            $table->string('first_name');
            $table->string('middle_name');
            $table->string('nickname');
            $table->string('sex');
            $table->date('birthdate');
            $table->string('nationality');
            $table->string('occupation');
            $table->string('relationship');
            $table->boolean('is_state_actor');
            $table->boolean('is_minor');
            $table->timestamps();

            $table->foreign('incident_no')
                ->references('incident_no')
                ->on('tbl_incident_client')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_perpetrator_status', function (Blueprint $table) {
            $table->increments('perpetrator_status_id')->primary();
            $table->unsignedInteger('perpetrator_id');
            $table->string('legal_complaint_status');
            $table->boolean('with_warrant');
            $table->string('whereabout');
            $table->timestamps();

            $table->foreign('perpetrator_id')
                ->references('perpetrator_id')
                ->on('tbl_perpetrator_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_perpetrator_birthplace', function (Blueprint $table) {
            $table->increments('perpetrator_birthplace_id')->primary();
            $table->unsignedInteger('perpetrator_id');
            $table->integer('region');
            $table->integer('province');
            $table->integer('citymuns');
            $table->timestamps();

            $table->foreign('perpetrator_id')
                ->references('perpetrator_id')
                ->on('tbl_perpetrator_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('citymuns')
                ->references('psgc_mun')
                ->on('psgc_mun')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_perpetrator_address', function (Blueprint $table) {
            $table->increments('perpetrator_address_id')->primary();
            $table->unsignedInteger('perpetrator_id');
            $table->integer('region');
            $table->integer('province');
            $table->integer('citymuns');
            $table->integer('barangay');
            $table->string('street');
            $table->string('house_no');
            $table->timestamps();

            $table->foreign('perpetrator_id')
                ->references('perpetrator_id')
                ->on('tbl_perpetrator_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('barangay')
                ->references('psgc_brgy')
                ->on('psgc_brgy')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_assistance_livelihood', function (Blueprint $table) {
            $table->increments('livelihood_assistance_id')->primary();
            $table->string('client_code');
            $table->string('intervention_provided')->default('Livelihood Assistance');
            $table->float('amount');
            $table->date('date');
            $table->string('fund_source');
            $table->timestamps();

            $table->foreign('client_code')
                ->references('client_code')
                ->on('tbl_victim_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_assistance_financial', function (Blueprint $table) {
            $table->increments('financial_assistance_id')->primary();
            $table->string('client_code');
            $table->string('intervention_provided')->default('Financial Assistance for Employment');
            $table->float('amount');
            $table->date('date');
            $table->string('fund_source');
            $table->timestamps();

            $table->foreign('client_code')
                ->references('client_code')
                ->on('tbl_victim_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_assistance_training', function (Blueprint $table) {
            $table->increments('training_assistance_id')->primary();
            $table->string('client_code');
            $table->string('intervention_provided')->default('Skills Training');
            $table->float('amount');
            $table->date('date');
            $table->string('fund_source');
            $table->timestamps();

            $table->foreign('client_code')
                ->references('client_code')
                ->on('tbl_victim_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_assistance_support', function (Blueprint $table) {
            $table->increments('support_assistance_id')->primary();
            $table->string('client_code');
            $table->string('intervention_provided')->default('Support for Victim/ Witnesses');
            $table->float('amount');
            $table->date('date');
            $table->string('fund_source');
            $table->timestamps();

            $table->foreign('client_code')
                ->references('client_code')
                ->on('tbl_victim_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_assistance_educational', function (Blueprint $table) {
            $table->increments('educational_assistance_id')->primary();
            $table->string('client_code');
            $table->string('intervention_provided')->default('Educational Assistance');
            $table->float('amount');
            $table->date('date');
            $table->string('fund_source');
            $table->timestamps();

            $table->foreign('client_code')
                ->references('client_code')
                ->on('tbl_victim_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_assistance_medical', function (Blueprint $table) {
            $table->increments('medical_assistance_id')->primary();
            $table->string('client_code');
            $table->string('intervention_provided')->default('Medical Assistance');
            $table->float('amount');
            $table->date('date');
            $table->string('fund_source');
            $table->timestamps();

            $table->foreign('client_code')
                ->references('client_code')
                ->on('tbl_victim_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_assistance_transportation', function (Blueprint $table) {
            $table->increments('transportation_assistance_id')->primary();
            $table->string('client_code');
            $table->string('intervention_provided')->default('Transportation/Balik Probinsya');
            $table->float('amount');
            $table->date('date');
            $table->string('fund_source');
            $table->timestamps();

            $table->foreign('client_code')
                ->references('client_code')
                ->on('tbl_victim_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_assistance_employment', function (Blueprint $table) {
            $table->increments('employment_assistance_id')->primary();
            $table->string('client_code');
            $table->string('intervention_provided')->default('Employment Assistance');
            $table->float('amount');
            $table->date('date');
            $table->string('fund_source');
            $table->timestamps();

            $table->foreign('client_code')
                ->references('client_code')
                ->on('tbl_victim_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_assistance_psychosocial', function (Blueprint $table) {
            $table->increments('psychosocial_counseling_id')->primary();
            $table->string('client_code');
            $table->string('intervention_provided')->default('Psychosocial Counseling');
            $table->date('counseling_date');
            $table->timestamps();

            $table->foreign('client_code')
                ->references('client_code')
                ->on('tbl_victim_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_assistance_temporary_shelter', function (Blueprint $table) {
            $table->increments('temporary_shelter_id')->primary();
            $table->string('client_code');
            $table->string('intervention_provided')->default('Temporary Shelter');
            $table->string('provider');
            $table->date('date');
            $table->timestamps();

            $table->foreign('client_code')
                ->references('client_code')
                ->on('tbl_victim_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_assistance_hygiene', function (Blueprint $table) {
            $table->increments('hygiene_kit_id')->primary();
            $table->string('client_code');
            $table->string('intervention_provided')->default('Hygiene Kit');
            $table->date('date');
            $table->timestamps();

            $table->foreign('client_code')
                ->references('client_code')
                ->on('tbl_victim_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_assistance_food', function (Blueprint $table) {
            $table->increments('assistance_food_id')->primary();
            $table->string('client_code');
            $table->string('intervention_provided')->default('Food');
            $table->date('date');
            $table->timestamps();

            $table->foreign('client_code')
                ->references('client_code')
                ->on('tbl_victim_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        Schema::create('tbl_assistance_referral', function (Blueprint $table) {
            $table->increments('assistance_referral_id')->primary();
            $table->string('client_code');
            $table->string('intervention_provided')->default('Referral');
            $table->date('date');
            $table->timestamps();

            $table->foreign('client_code')
                ->references('client_code')
                ->on('tbl_victim_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_perpetrator_address');
        Schema::dropIfExists('tbl_perpetrator_birthplace');
        Schema::dropIfExists('tbl_perpetrator_info');
        Schema::dropIfExists('tbl_perpetrator_status');
        Schema::dropIfExists('tbl_incident_location');
        Schema::dropIfExists('tbl_informant_info');
        Schema::dropIfExists('tbl_administrative_info');
        Schema::dropIfExists('tbl_victim_address');
        Schema::dropIfExists('tbl_victim_employment');
        Schema::dropIfExists('tbl_victim_birthplace');
        Schema::dropIfExists('tbl_victim_info');
        Schema::dropIfExists('tbl_incident_info');
        Schema::dropIfExists('tbl_assistance_livelihood');
        Schema::dropIfExists('tbl_assistance_financial');
        Schema::dropIfExists('tbl_assistance_skills_training');
        Schema::dropIfExists('tbl_assistance_medical');
        Schema::dropIfExists('tbl_assistance_educational');
        Schema::dropIfExists('tbl_assistance_support');
        Schema::dropIfExists('tbl_assistance_psychosocial');
        Schema::dropIfExists('tbl_assistance_temporary_shelter');
        Schema::dropIfExists('tbl_assistance_employment');
        Schema::dropIfExists('tbl_assistance_hygiene');
        Schema::dropIfExists('tbl_assistance_food');
        Schema::dropIfExists('tbl_assistance_transportation');
        Schema::dropIfExists('tbl_assistance_referral');
        Schema::dropIfExists('tbl_incident_client');
    }
};

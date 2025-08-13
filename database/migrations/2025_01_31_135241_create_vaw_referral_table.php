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
        // Referring Organization Information
        Schema::create('tbl_referring_org_info', function (Blueprint $table) {
            $table->id('referring_org_id'); // Changed from increments to bigInteger
            $table->string('client_code')->nullable();
            $table->string('incident_no')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('referring_org')->nullable();
            $table->string('action_taken')->nullable();
            $table->string('referring_lastname')->nullable();
            $table->string('referring_firstname')->nullable();
            $table->string('referring_middlename')->nullable();
            $table->string('referring_ext')->nullable();
            $table->string('referring_position')->nullable();
            $table->string('contact_no')->nullable();
            $table->string('email_address')->nullable();
            $table->string('office_address')->nullable();
            $table->timestamps();

            $table->foreign('client_code')
                ->references('client_code')
                ->on('tbl_incident_client')
                ->onUpdate('cascade')
                ->onDelete('cascade');

        });

        // Referred Service Information
        Schema::create('tbl_referred_service_info', function (Blueprint $table) {
            $table->id('referred_info_id');
            $table->unsignedBigInteger('referring_org_id');
            $table->string('incident_no')->nullable();
            $table->string('client_code')->nullable();
            $table->unsignedInteger('service_id')->nullable();
            $table->string('referred_to')->nullable();
            $table->string('referred_service')->nullable();
            $table->string('others')->nullable();
            $table->timestamps();

            $table->foreign('incident_no')
                ->references('incident_no')
                ->on('tbl_incident_client')
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->foreign('service_id')
                ->references('maintenance_id')
                ->on('tbl_maintenance')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        // Referred Organization Information
        Schema::create('tbl_referred_org_info', function (Blueprint $table) {
            $table->id('referred_org_id');
            $table->unsignedBigInteger('referred_info_id')->nullable();
            $table->string('agency_org')->nullable();
            $table->integer('region')->nullable();
            $table->integer('province')->nullable();
            $table->integer('citymuns')->nullable();
            $table->integer('barangay')->nullable();
            $table->string('street')->nullable();
            $table->integer('no')->nullable();
            $table->timestamps();

            $table->foreign('referred_info_id')
                ->references('referred_info_id')
                ->on('tbl_referred_service_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        // Referred Organization Contact
        Schema::create('tbl_referred_org_contact', function (Blueprint $table) {
            $table->id('referred_contact_id');
            $table->unsignedBigInteger('referred_org_id')->nullable();
            $table->string('lastname')->nullable();
            $table->string('firstname')->nullable();
            $table->string('middlename')->nullable();
            $table->string('ext')->nullable();
            $table->string('contact_no')->nullable(); // Changed from integer to string
            $table->string('position')->nullable();
            $table->string('email')->nullable();
            $table->timestamps();

            $table->foreign('referred_org_id')
                ->references('referred_org_id')
                ->on('tbl_referred_org_info')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        // Referred Organization Received
        Schema::create('tbl_referred_org_received', function (Blueprint $table) {
            $table->increments('referred_received_id')->primary();
            $table->unsignedBigInteger('referred_contact_id')->nullable();
            $table->string('client_code')->nullable();
            $table->string('received_by')->nullable();
            $table->string('position')->nullable();
            $table->string('remarks')->nullable();
            $table->string('client')->nullable();
            $table->string('referring_staff')->nullable();
            $table->timestamps();

            $table->foreign('referred_contact_id')
                ->references('referred_contact_id')
                ->on('tbl_referred_org_contact')
                ->onUpdate('cascade')
                ->onDelete('cascade');
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
        Schema::dropIfExists('tbl_referred_org_received');
        Schema::dropIfExists('tbl_referred_org_contact');
        Schema::dropIfExists('tbl_referred_org_info');
        Schema::dropIfExists('tbl_referred_service_info');
        Schema::dropIfExists('tbl_referring_org_info');
    }
};

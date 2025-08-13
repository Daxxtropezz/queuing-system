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
        Schema::create('tbl_maintenance', function (Blueprint $table) {
            $table->increments('maintenance_id');
            $table->string('category_name');
            $table->longText('category_value');
            $table->longText('parent_category')->nullable();
            $table->string('category_des')->nullable();
            $table->string('category_module')->nullable();
            $table->string('created_by');
            $table->string('updated_by')->nullable();
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_maintenance');
    }
};

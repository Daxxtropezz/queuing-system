<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateQueueTicketsTable extends Migration
{
  // database/migrations/xxxx_xx_xx_create_queue_tickets_table.php
public function up()
{
    Schema::create('queue_tickets', function (Blueprint $table) {
        $table->id();
        $table->integer('number');
        $table->foreignId('transaction_type_id')->constrained('transaction_types');
        $table->string('status')->default('waiting');
        $table->foreignId('served_by')->nullable()->constrained('users');
         $table->string('teller_number')->nullable();
        $table->timestamps();
    });
}

    public function down()
    {
        Schema::dropIfExists('queue_tickets');
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateQueueTicketsTable extends Migration
{
    public function up()
    {
        Schema::create('queue_tickets', function (Blueprint $table) {
            $table->id();
            $table->integer('number');
            $table->string('transaction_type');
            $table->string('status')->default('waiting');
            $table->unsignedBigInteger('served_by')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('queue_tickets');
    }
}

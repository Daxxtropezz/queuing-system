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
        $table->foreignId('transaction_type_id')->nullable()->constrained('transaction_types');
        $table->foreignId('teller_id')->nullable()->constrained('tellers');

        // Track what step the ticket is currently in
        $table->enum('step', [1, 2])->default(1);

        // Teller remarks from Step 1 (visible in Step 2)
        $table->text('remarks')->nullable();

        // Status: waiting, serving, finished
        $table->string('status')->default('waiting');

        $table->foreignId('served_by')->nullable()->constrained('users');
        $table->boolean('ispriority')->default(0);

        $table->timestamp('started_at')->nullable(); 
        $table->timestamp('finished_at')->nullable();
        $table->timestamps();
    });
}



    public function down()
    {
        Schema::dropIfExists('queue_tickets');
    }
}

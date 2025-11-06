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

        $table->foreignId('served_by_step1')->nullable()->constrained('users');
        $table->foreignId('served_by_step2')->nullable()->constrained('users');
        $table->boolean('ispriority')->default(0);

        // Per-step timestamps
        $table->timestamp('started_at_step1')->nullable();
        $table->timestamp('finished_at_step1')->nullable();
        $table->timestamp('started_at_step2')->nullable();
        $table->timestamp('finished_at_step2')->nullable();

        $table->timestamps();
    });
}



    public function down()
    {
        Schema::dropIfExists('queue_tickets');
    }
}

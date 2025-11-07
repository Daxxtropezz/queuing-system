<?php

use App\Http\Controllers\QueueController;
use Illuminate\Support\Facades\Route;

// Step 1 Teller Page (restricted to Step1-Teller role)
Route::middleware(['auth', 'verified', 'role:Step1-Teller|Administrator'])->group(function () {
    Route::get('/queue/teller-step1', [QueueController::class, 'tellerStep1Page'])->name('queue.teller.step1');
    Route::post('/teller/assign-step1', [QueueController::class, 'assignTellerStep1'])->name('queue.teller.assign.step1');
    Route::post('/queue/teller/grab-step1', [QueueController::class, 'grabStep1Number'])->name('queue.teller.grab.step1');
    Route::post('/queue/teller/next-step1', [QueueController::class, 'nextStep1Number'])->name('queue.teller.next.step1');
    Route::post('/queue/teller/override-step1', [QueueController::class, 'overrideStep1Number'])->name('queue.teller.override.step1');
    Route::post('/teller/reset-step1', [QueueController::class, 'resetTellerStep1'])->name('teller.reset.step1');
    Route::post('/queue/teller/manual-override', [QueueController::class, 'manualOverrideStep1Number'])->name('queue.teller.step1.manual-override');
    Route::post('/queue/teller-step1/search-no-show', [QueueController::class, 'searchNoShowTicket'])->name('queue.teller.step1.search-no-show');
    Route::post('/teller/serve-no-show', [QueueController::class, 'serveNoShow'])->name('queue.teller.serve-no-show');
    Route::post('/queue/teller/set-transaction-type', [QueueController::class, 'setTransactionType'])
        ->name('queue.teller.setTransactionType');
});

// Step 2 Teller Page (restricted to Step2-Teller role)
Route::middleware(['auth', 'verified', 'role:Step2-Teller|Administrator'])->group(function () {
    Route::get('/queue/teller-step2', [QueueController::class, 'tellerStep2Page'])->name('queue.teller.step2');
    Route::post('/teller/assign-step2', [QueueController::class, 'assignTellerStep2'])->name('queue.teller.assign.step2');
    Route::post('/queue/teller/grab-step2', [QueueController::class, 'grabStep2Number'])->name('queue.teller.grab.step2');
    Route::post('/queue/teller/next-step2', [QueueController::class, 'nextStep2Number'])->name('queue.teller.next.step2');
    Route::post('/queue/teller/override-step2', [QueueController::class, 'overrideStep2Number'])->name('queue.teller.override.step2');
    Route::post('/teller/reset-step2', [QueueController::class, 'resetTellerStep2'])->name('queue.teller.reset.step2');
    Route::post('/queue/teller/step2/manual-override', [QueueController::class, 'manualOverrideStep2Number'])
        ->name('queue.teller.step2.manual-override');
    Route::post('/queue/teller-step2/search-no-show', [QueueController::class, 'searchNoShowStep2Ticket'])->name('queue.teller.step2.search-no-show');
    Route::post('/queue/serve-no-show/step2', [QueueController::class, 'serveNoShowStep2'])->name('queue.teller.serve-no-show.step2');
    Route::post('/queue/teller/no-show-step2', [QueueController::class, 'markNoShowStep2'])->name('queue.teller.no-show.step2');
    // Route::post('/queue/serve-no-show/step2', [QueueController::class, 'serveNoShowStep2'])->name('queue.serve_no_show.step2');
});

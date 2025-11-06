<?php

use App\Http\Controllers\QueueController;
use Illuminate\Support\Facades\Route;

Route::get('/queue/guard', [QueueController::class, 'guardPage'])->name('queue.guard');
Route::get('/queue/guard/status', [QueueController::class, 'status'])->name('queue.guard.status');
Route::post('/queue/guard/generate', [QueueController::class, 'generateNumber'])->name('queue.guard.generate');

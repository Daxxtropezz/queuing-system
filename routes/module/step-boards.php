<?php

use App\Http\Controllers\QueueController;
use Illuminate\Support\Facades\Route;

Route::get('/queue/step-1', [QueueController::class, 'mainPage'])->name('queue.s1');
Route::get('/queue/step-2', [QueueController::class, 'servingPage2'])->name('queue.s2');

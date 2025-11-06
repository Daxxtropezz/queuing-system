<?php

use App\Http\Controllers\VideoController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:Administrator'])->group(function () {
    Route::resource('videos', VideoController::class);
    Route::post('videos/{video}', [VideoController::class, 'update'])->name('videos.update');
});

// API endpoints (public) — avoid collision with /videos resource routes
Route::get('/api/videos/active', [VideoController::class, 'active'])
    ->name('api.videos.active')
    ->withoutMiddleware(['auth']);

Route::get('/api/videos/{video}/exists', [VideoController::class, 'exists'])
    ->name('api.videos.exists')
    ->withoutMiddleware(['auth']);

<?php

use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');
    Route::get('settings/profile', [ProfileController::class, 'index'])->name('profile.edit');
    Route::get('settings/preferences', [ProfileController::class, 'twoFactorAuth'])->name('password.edit');
});

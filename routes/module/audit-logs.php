<?php


use App\Http\Controllers\AuditLogController;
use Illuminate\Support\Facades\Route;

// Audit Logs (Accounting Officer + Admin)
Route::group(['middleware' => ['auth', 'verified', 'role:Administrator']], function () {
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
});
Route::post('/log-activity', [AuditLogController::class, 'log'])
    ->middleware('auth');

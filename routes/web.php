<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Config;
use App\Http\Middleware\DjangoAuthMiddleware;
use App\Http\Controllers\Auth\AuthControllerDjango;
use App\Http\Controllers\QueueController;
use App\Http\Controllers\QueueBoardController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TellerController;
use App\Http\Controllers\TransactionTypeController;
use SebastianBergmann\CodeCoverage\Report\Xml\Report;

// Redirect to login by default
Route::get('/', function () {
    return redirect()->route('queue.s1');
})->name('home');

// Use the custom AuthControllerDjango for login
Route::post('djangologin', [AuthControllerDjango::class, 'login'])->name('djangologin');

Route::get('/twodasactor-challenge', function () {
    return Inertia::render('auth/TwoFactorChallenge');
})->middleware(middleware: ['guest'])->name('two-factor.login');

Route::middleware(['auth', 'verified'])->group(function () {

    // Optional: Add a new home route for authenticated users
    Route::get('/home', function () {
        return redirect()->route('queue.teller.step1');
    })->name('home.authenticated');
});

// Route to get the public key
Route::get('/public-key', function () {
    $publicKey = Config::get('app.rsa_public_key'); // Or 'security.rsa_public_key' if in config/security.php

    if (!$publicKey) {
        abort(500, 'Public key not configured');
    }

    // Normalize key formatting
    $formattedKey = str_replace('\n', "\n", $publicKey);
    return response($formattedKey, 200)->header('Content-Type', 'text/plain');
});

// Queuing System Routes
Route::middleware(['auth', 'verified', 'role:Administrator'])->group(function () {
    Route::resource('transaction-types', TransactionTypeController::class);
    Route::resource('tellers', TellerController::class);
    Route::get('/reports/step1', [ReportController::class, 'step1'])->name('reports.step1');
    Route::get('/reports/step2', [ReportController::class, 'step2'])->name('reports.step2');
    Route::post('/export', [ReportController::class, 'export'])->name('reports.export');
});

// Public queue board JSON (no auth middleware)
Route::get('/queue/board-data', [QueueBoardController::class, 'data'])->name('queue.board.data');

// Public JSON endpoint for serving tickets (polled by main-page)
Route::get('/queue/serving', [QueueController::class, 'servingIndex'])->name('queue.serving.index');

foreach (glob(__DIR__ . '/module/*.php') as $routeFile) {
    require $routeFile;
}

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

<?php

use App\Http\Controllers\ActivitylogsController;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Config;
use App\Http\Middleware\DjangoAuthMiddleware;
use App\Http\Controllers\Auth\AuthControllerDjango;
use App\Http\Controllers\CitymunsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\ProvinceController;
use App\Http\Controllers\PsgcController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\QueueController;
use App\Http\Controllers\QueueBoardController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TellerController;
use App\Http\Controllers\TransactionTypeController;
use App\Http\Controllers\VideoController;
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
    // Route::get('dashboard', function () {
    //     return Inertia::render('dashboard');
    // })->name('dashboard');

    // Optional: Add a new home route for authenticated users
    Route::get('/home', function () {
        return redirect()->route('queue.teller');
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


// Region Management
Route::group(['middleware' => ['verified', 'role:Administrator']], function () {
    Route::get('/region', [RegionController::class, 'index'])->name('region.index');
    Route::get('/region/create', [RegionController::class, 'create'])->name('region.create');
    Route::post('/region', [RegionController::class, 'store'])->name('region.store');
    Route::get('/region/{region}', [RegionController::class, 'show'])->name('region.show');
    Route::get('/region/{region}/edit', [RegionController::class, 'edit'])->name('region.edit');
    Route::put('/region/{region}', [RegionController::class, 'update'])->name('region.update');
    Route::delete('/region/{region}', [RegionController::class, 'destroy'])->name('region.destroy');
});

// Province Management
Route::group(['middleware' => ['verified', 'role:Administrator']], function () {
    Route::get('/province', [ProvinceController::class, 'index'])->name('province.index');
    Route::get('/province/create', [ProvinceController::class, 'create'])->name('province.create');
    Route::post('/province', [ProvinceController::class, 'store'])->name('province.store');
    Route::get('/province/{province}', [ProvinceController::class, 'show'])->name('province.show');
    Route::get('/province/{province}/edit', [ProvinceController::class, 'edit'])->name('province.edit');
    Route::put('/province/{province}', [ProvinceController::class, 'update'])->name('province.update');
    Route::delete('/province/{province}', [ProvinceController::class, 'destroy'])->name('province.destroy');
});

// City/Municipality Management
Route::group(['middleware' => ['verified', 'role:Administrator']], function () {
    Route::get('/citymun', [CitymunsController::class, 'index'])->name('citymun.index');
    Route::get('/citymun/create', [CitymunsController::class, 'create'])->name('citymun.create');
    Route::post('/citymun', [CitymunsController::class, 'store'])->name('citymun.store');
    Route::get('/citymun/{citymun}', [CitymunsController::class, 'show'])->name('citymun.show');
    Route::get('/citymun/{citymun}/edit', [CitymunsController::class, 'edit'])->name('citymun.edit');
    Route::put('/citymun/{citymun}', [CitymunsController::class, 'update'])->name('citymun.update');
    Route::delete('/citymun/{citymun}', [CitymunsController::class, 'destroy'])->name('citymun.destroy');
});

//Maintenance Management
Route::group(['middleware' => ['verified', 'role:Administrator']], function () {
    Route::get('/maintenance', [MaintenanceController::class, 'index'])->name('maintenance.index');
    Route::get('/maintenance/create', [MaintenanceController::class, 'create'])->name('maintenance.create');
    Route::post('/maintenance', [MaintenanceController::class, 'store'])->name('maintenance.store');
    Route::get('/maintenance/{maintenance}', [MaintenanceController::class, 'show'])->name('maintenance.show');
    Route::get('/maintenance/{maintenance}/edit', [MaintenanceController::class, 'edit'])->name('maintenance.edit');
    Route::put('/maintenance/{maintenance}', [MaintenanceController::class, 'update'])->name('maintenance.update');
    Route::delete('/maintenance/{maintenance}', [MaintenanceController::class, 'destroy'])->name('maintenance.destroy');
});

//PSGC Import
Route::get('/import-psgc', [PsgcController::class, 'importPsgc'])->middleware(['verified']);

//PSGC Dropdowns
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/regions', [DashboardController::class, 'getRegions']);
    Route::get('/provinces/{regionId}', [DashboardController::class, 'getProvinces']);
    Route::get('/citymuns/{provinceId}', [DashboardController::class, 'getCityMuns']);
    Route::get('/barangays/{citymunId}', [DashboardController::class, 'getBarangays']);
});

// Activity Logs
// Route::get('/logs', [ActivitylogsController::class, 'index'])
//     ->middleware(['verified'])
//     ->name('audit_logs');

// DATA MANAGEMENT

// User Management
Route::group(['middleware' => ['auth', 'role:Administrator']], routes: function () {
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
    Route::put('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
    Route::put('/users/{user}/change-role', [UserController::class, 'changeRole']);
});

// Queuing System Routes
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
    Route::post('/teller/serve-no-show-step2', [QueueController::class, 'serveNoShowStep2'])->name('queue.teller.serve-no-show.step2');
    Route::post('/queue/teller/no-show-step2', [QueueController::class, 'markNoShowStep2'])->name('queue.teller.no-show.step2');
});

Route::middleware(['auth', 'verified', 'role:Administrator'])->group(function () {
    Route::resource('transaction-types', TransactionTypeController::class);
    Route::resource('videos', VideoController::class);
    Route::post('videos/{video}', [VideoController::class, 'update'])->name('videos.update');
    Route::resource('tellers', TellerController::class);
    Route::resource('reports', ReportController::class);
    Route::post('/reports/export', [ReportController::class, 'export'])->name('reports.export');
});

Route::get('/queue/step-1', [QueueController::class, 'mainPage'])->name('queue.s1');
Route::get('/queue/step-2', [QueueController::class, 'servingPage2'])->name('queue.s2');
Route::get('/queue/guard', [QueueController::class, 'guardPage'])->name('queue.guard');
Route::get('/queue/guard/status', [QueueController::class, 'status'])->name('queue.guard.status');
Route::post('/queue/guard/generate', [QueueController::class, 'generateNumber'])->name('queue.guard.generate');

// Public queue board JSON (no auth middleware)
Route::get('/queue/board-data', [QueueBoardController::class, 'data'])->name('queue.board.data');

// Public JSON endpoint for serving tickets (polled by main-page)
Route::get('/queue/serving', [QueueController::class, 'servingIndex'])->name('queue.serving.index');


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

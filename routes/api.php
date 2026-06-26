<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AlertController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\ChantierController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\FuelRecordController;
use App\Http\Controllers\MechanicController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\WorkOrderController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok', 'app' => 'VICAS GMAO API', 'version' => '1.0.0']));

// Auth publique
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {

    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',      [AuthController::class, 'me']);
    });

    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Véhicules
    Route::get('/vehicles',             [VehicleController::class, 'index']);
    Route::get('/vehicles/{vehicle}',   [VehicleController::class, 'show']);
    Route::middleware('role:administrateur,responsable_logistique,chef_atelier')->group(function () {
        Route::post('/vehicles',              [VehicleController::class, 'store']);
        Route::put('/vehicles/{vehicle}',     [VehicleController::class, 'update']);
        Route::delete('/vehicles/{vehicle}',  [VehicleController::class, 'destroy']);
    });

    // Bons de travail
    Route::get('/work-orders',              [WorkOrderController::class, 'index']);
    Route::get('/work-orders/{workOrder}',  [WorkOrderController::class, 'show']);
    Route::middleware('role:administrateur,responsable_logistique,chef_atelier,mecanicien')->group(function () {
        Route::post('/work-orders',                   [WorkOrderController::class, 'store']);
        Route::put('/work-orders/{workOrder}',        [WorkOrderController::class, 'update']);
        Route::post('/work-orders/{workOrder}/close', [WorkOrderController::class, 'close']);
    });
    Route::middleware('role:administrateur,chef_atelier')->group(function () {
        Route::delete('/work-orders/{workOrder}', [WorkOrderController::class, 'destroy']);
    });

    // Carburant
    Route::get('/fuel-records',             [FuelRecordController::class, 'index']);
    Route::get('/fuel-records/stats',       [FuelRecordController::class, 'stats']);
    Route::get('/fuel-records/{fuelRecord}',[FuelRecordController::class, 'show']);
    Route::middleware('role:administrateur,responsable_logistique,chauffeur')->group(function () {
        Route::post('/fuel-records', [FuelRecordController::class, 'store']);
    });
    Route::middleware('role:administrateur,responsable_logistique')->group(function () {
        Route::delete('/fuel-records/{fuelRecord}', [FuelRecordController::class, 'destroy']);
    });

    // Chantiers
    Route::get('/chantiers',            [ChantierController::class, 'index']);
    Route::get('/chantiers/{chantier}', [ChantierController::class, 'show']);
    Route::middleware('role:administrateur,responsable_logistique')->group(function () {
        Route::post('/chantiers',               [ChantierController::class, 'store']);
        Route::put('/chantiers/{chantier}',     [ChantierController::class, 'update']);
        Route::delete('/chantiers/{chantier}',  [ChantierController::class, 'destroy']);
    });

    // Affectations
    Route::get('/assignments',              [AssignmentController::class, 'index']);
    Route::get('/assignments/{assignment}', [AssignmentController::class, 'show']);
    Route::middleware('role:administrateur,responsable_logistique')->group(function () {
        Route::post('/assignments',                   [AssignmentController::class, 'store']);
        Route::post('/assignments/{assignment}/end',  [AssignmentController::class, 'end']);
        Route::delete('/assignments/{assignment}',    [AssignmentController::class, 'destroy']);
    });

    // Alertes
    Route::get('/alerts',         [AlertController::class, 'index']);
    Route::get('/alerts/{alert}', [AlertController::class, 'show']);
    Route::middleware('role:administrateur,responsable_logistique,chef_atelier')->group(function () {
        Route::post('/alerts', [AlertController::class, 'store']);
    });
    Route::middleware('role:administrateur,chef_atelier')->group(function () {
        Route::post('/alerts/{alert}/treat', [AlertController::class, 'treat']);
        Route::delete('/alerts/{alert}',     [AlertController::class, 'destroy']);
    });

    // Chauffeurs
    Route::get('/drivers',          [DriverController::class, 'index']);
    Route::get('/drivers/{driver}', [DriverController::class, 'show']);
    Route::middleware('role:administrateur,responsable_logistique')->group(function () {
        Route::post('/drivers',             [DriverController::class, 'store']);
        Route::put('/drivers/{driver}',     [DriverController::class, 'update']);
        Route::delete('/drivers/{driver}',  [DriverController::class, 'destroy']);
    });

    // Mécaniciens
    Route::get('/mechanics',            [MechanicController::class, 'index']);
    Route::get('/mechanics/{mechanic}', [MechanicController::class, 'show']);
    Route::middleware('role:administrateur,chef_atelier')->group(function () {
        Route::post('/mechanics',               [MechanicController::class, 'store']);
        Route::put('/mechanics/{mechanic}',     [MechanicController::class, 'update']);
        Route::delete('/mechanics/{mechanic}',  [MechanicController::class, 'destroy']);
    });

    // Admin — Utilisateurs
    Route::middleware('role:administrateur')->prefix('admin')->group(function () {
        Route::get('/users',                        [UserController::class, 'index']);
        Route::post('/users',                       [UserController::class, 'store']);
        Route::get('/users/{user}',                 [UserController::class, 'show']);
        Route::put('/users/{user}',                 [UserController::class, 'update']);
        Route::patch('/users/{user}/toggle-active', [UserController::class, 'toggleActive']);
        Route::delete('/users/{user}',              [UserController::class, 'destroy']);
    });
});

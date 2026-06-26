<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('plate')->unique();
            $table->enum('type', [
                'camion', 'pelleteuse', 'grue', 'compacteur',
                'bulldozer', 'chargeuse', 'nacelle', 'vehicule_leger',
            ]);
            $table->string('brand');
            $table->string('model');
            $table->smallInteger('year');
            $table->unsignedInteger('km')->default(0);
            $table->unsignedInteger('hours')->default(0);
            $table->enum('status', [
                'disponible', 'en_mission', 'en_maintenance', 'en_panne', 'hors_service',
            ])->default('disponible');
            $table->enum('fuel_type', ['diesel', 'essence'])->default('diesel');
            $table->unsignedSmallInteger('tank_capacity')->default(0);
            $table->date('acquisition_date')->nullable();
            $table->string('chassis_number')->nullable();
            $table->date('insurance_expiry')->nullable();
            $table->date('technical_visit_expiry')->nullable();
            $table->date('last_maintenance_date')->nullable();
            $table->unsignedInteger('next_maintenance_km')->default(0);
            $table->string('site')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->enum('type', [
                'vidange', 'revision', 'assurance', 'visite_technique', 'compteur',
            ]);
            $table->enum('level', ['info', 'warning', 'danger', 'critical'])->default('info');
            $table->text('message');
            $table->date('due_date')->nullable();
            $table->boolean('treated')->default(false);
            $table->timestamp('treated_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Bons de travail ───────────────────────────────────
        Schema::create('work_orders', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique(); // BT-2026-XXXX
            $table->foreignId('vehicle_id')->constrained('vehicles')->restrictOnDelete();
            $table->enum('type', ['preventive', 'corrective'])->default('corrective');
            $table->text('description');
            $table->foreignId('mechanic_id')->constrained('mechanics')->restrictOnDelete();
            $table->date('date');
            $table->enum('status', [
                'ouvert', 'en_cours', 'attente_pieces', 'termine', 'cloture',
            ])->default('ouvert');
            $table->decimal('hours_worked', 6, 2)->default(0);
            $table->decimal('labor_cost_per_hour', 10, 2)->default(0);
            $table->text('observations')->nullable();
            $table->timestamps();
        });

        // ── Pièces des bons de travail ────────────────────────
        Schema::create('bt_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->cascadeOnDelete();
            $table->string('ref')->nullable();
            $table->string('designation');
            $table->unsignedSmallInteger('qty')->default(1);
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bt_parts');
        Schema::dropIfExists('work_orders');
    }
};

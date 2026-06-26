<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'plate', 'type', 'brand', 'model', 'year', 'km', 'hours',
        'status', 'fuel_type', 'tank_capacity', 'acquisition_date',
        'chassis_number', 'insurance_expiry', 'technical_visit_expiry',
        'last_maintenance_date', 'next_maintenance_km', 'site', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'acquisition_date'         => 'date',
            'insurance_expiry'         => 'date',
            'technical_visit_expiry'   => 'date',
            'last_maintenance_date'    => 'date',
            'km'                       => 'integer',
            'hours'                    => 'integer',
            'tank_capacity'            => 'integer',
            'next_maintenance_km'      => 'integer',
            'year'                     => 'integer',
        ];
    }

    // ── Relations ─────────────────────────────────────────
    public function workOrders(): HasMany
    {
        return $this->hasMany(WorkOrder::class);
    }

    public function fuelRecords(): HasMany
    {
        return $this->hasMany(FuelRecord::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    // ── Scopes ────────────────────────────────────────────
    public function scopeAvailable($query)
    {
        return $query->where('status', 'disponible');
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}

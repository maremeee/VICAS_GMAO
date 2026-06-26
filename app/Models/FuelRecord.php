<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FuelRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id', 'driver_id', 'date', 'fuel_type',
        'liters', 'cost', 'odometer', 'supplier',
    ];

    protected function casts(): array
    {
        return [
            'date'     => 'date',
            'liters'   => 'float',
            'cost'     => 'float',
            'odometer' => 'integer',
        ];
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function getPricePerLiterAttribute(): float
    {
        return $this->liters > 0 ? round($this->cost / $this->liters, 2) : 0;
    }
}

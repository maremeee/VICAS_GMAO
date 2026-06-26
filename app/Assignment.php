<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Assignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id', 'driver_id', 'chantier_id',
        'start_date', 'end_date', 'departure_km',
        'return_km', 'status', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'start_date'   => 'date',
            'end_date'     => 'date',
            'departure_km' => 'integer',
            'return_km'    => 'integer',
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

    public function chantier(): BelongsTo
    {
        return $this->belongsTo(Chantier::class);
    }

    public function getDistanceAttribute(): ?int
    {
        if ($this->return_km && $this->departure_km) {
            return $this->return_km - $this->departure_km;
        }
        return null;
    }
}

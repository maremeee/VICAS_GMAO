<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class WorkOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'number', 'vehicle_id', 'type', 'description', 'mechanic_id',
        'date', 'status', 'hours_worked', 'labor_cost_per_hour', 'observations',
    ];

    protected function casts(): array
    {
        return [
            'date'                => 'date',
            'hours_worked'        => 'float',
            'labor_cost_per_hour' => 'float',
        ];
    }

    // ── Génération automatique du numéro BT ───────────────
    protected static function booted(): void
    {
        static::creating(function (WorkOrder $wo) {
            if (empty($wo->number)) {
                $year  = now()->year;
                $last  = static::whereYear('created_at', $year)->count();
                $wo->number = 'BT-' . $year . '-' . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    // ── Relations ─────────────────────────────────────────
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function mechanic(): BelongsTo
    {
        return $this->belongsTo(Mechanic::class);
    }

    public function parts(): HasMany
    {
        return $this->hasMany(BTPart::class);
    }

    // ── Calcul des coûts ──────────────────────────────────
    public function getPartsTotalAttribute(): float
    {
        return $this->parts->sum(fn($p) => $p->qty * $p->unit_price);
    }

    public function getLaborTotalAttribute(): float
    {
        return $this->hours_worked * $this->labor_cost_per_hour;
    }

    public function getGrandTotalAttribute(): float
    {
        return $this->parts_total + $this->labor_total;
    }
}

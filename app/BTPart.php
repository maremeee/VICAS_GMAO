<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BTPart extends Model
{
    protected $table = 'bt_parts';

    protected $fillable = [
        'work_order_id', 'ref', 'designation', 'qty', 'unit_price',
    ];

    protected function casts(): array
    {
        return [
            'qty'        => 'integer',
            'unit_price' => 'float',
        ];
    }

    public function getTotalAttribute(): float
    {
        return $this->qty * $this->unit_price;
    }

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }
}

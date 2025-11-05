<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QueueTicket extends Model
{
    use HasFactory;

    protected $table = 'queue_tickets';

    // Always eager-load these relations so frontend receives teller/transactionType consistently
    protected $with = ['teller', 'transactionType'];

    protected $fillable = [
        'step',
        'number',
        'transaction_type_id',
        'teller_id',
        'status',
        'ispriority',
        'started_at',
        'finished_at',
        'served_by',
        'remarks',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = ['formatted_number'];

    public function getFormattedNumberAttribute()
    {
        // Pad the number to 4 digits
        return str_pad($this->number, 4, '0', STR_PAD_LEFT);
    }

    protected function isPriority(): Attribute
    {
        return Attribute::make(
            get: fn(mixed $value, array $attributes) => (bool) $attributes['ispriority'],
        );
    }


    public function transactionType()
    {
        return $this->belongsTo(TransactionType::class);
    }

    public function teller()
    {
        return $this->belongsTo(Teller::class, 'teller_id');
    }


    public function servedBy()
    {
        return $this->belongsTo(User::class, 'served_by');
    }
}

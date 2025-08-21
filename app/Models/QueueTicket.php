<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QueueTicket extends Model
{
    use HasFactory;

    protected $table = 'queue_tickets';

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


    public function transactionType()
    {
        return $this->belongsTo(TransactionType::class);
    }

    public function teller()
    {
        return $this->belongsTo(Teller::class);
    }

    public function servedBy()
    {
        return $this->belongsTo(User::class, 'served_by');
    }
}

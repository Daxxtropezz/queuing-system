<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QueueTicket extends Model
{
    use HasFactory;

    protected $table = 'queue_tickets';

    protected $fillable = [
        'number',
        'transaction_type_id',
         'teller_number',
        'status',
        'served_by',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = ['formatted_number'];

  public function getFormattedNumberAttribute()
{
    $type = '';
    if ($this->relationLoaded('transactionType') && $this->transactionType) {
        $type = strtoupper(substr($this->transactionType->name, 0, 3));
    }
    return sprintf('%s-%03d', $type, $this->number);
}

    public function transactionType()
    {
        return $this->belongsTo(TransactionType::class);
    }
}

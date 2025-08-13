<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QueueTicket extends Model
{
    protected $fillable = [
        'number',
        'transaction_type',
        'status',
        'served_by',
    ];
}

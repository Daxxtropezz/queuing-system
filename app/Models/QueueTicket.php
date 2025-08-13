<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QueueTicket extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'number',
        'transaction_type',
        'status',
        'served_by',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function getFormattedNumberAttribute()
    {
        return strtoupper(substr($this->transaction_type, 0, 1)) . str_pad($this->number, 3, '0', STR_PAD_LEFT);
    }
}

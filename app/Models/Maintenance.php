<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Maintenance extends Model
{
    use LogsActivity;

    public $timestamps = true;

    protected $table = 'tbl_maintenance';

    protected $primaryKey = 'maintenance_id';

    // Columns that can be mass-assigned
    protected $fillable = [
        'maintenance_id',
        'category_name',
        'category_value',
        'category_des',
        'category_module',
        'created_by',
        'updated_by',
    ];

    protected static function boot()
    {
        parent::boot();

        // Setting default values when creating a new record
        static::creating(function ($model) {
            $model->category_des    = $model->category_des ?? '';
            $model->category_module = $model->category_module ?? '';
            $model->updated_at      = null;
        });

        // Ensure updated_at is set during updates
        // static::updating(function ($model) {
        //     $model->updated_at = null;
        // });
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by')->select('id', 'first_name', 'last_name');
    }

    // Relationship for updated_by
    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by')->select('id', 'first_name', 'last_name');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'category_name',
                'category_value',
                'category_des',
                'category_module',
                'created_by',
                'updated_by',
            ])
            ->logOnlyDirty() // Log only changes
            ->setDescriptionForEvent(fn(string $eventName) => "Maintenance record {$eventName} for Maintenance ID: {$this->maintenance_id}");
    }
}

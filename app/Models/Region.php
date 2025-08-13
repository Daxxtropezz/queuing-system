<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Region extends Model
{
    use LogsActivity;
    // Table associated with the model (if not default pluralized name)
    protected $table = 'psgc_reg';

    protected $primaryKey = 'psgc_reg';

    // Columns that can be mass-assigned
    protected $fillable = [
        'psgc_reg',
        'reg_name',
        'region',
    ];

    public function getFillable()
    {
        if (request()->isMethod('post')) { // Assuming POST for create
            return array_merge($this->fillable, ['psgc_reg']);
        }
        return $this->fillable;
    }

    public function provinces()
    {
        return $this->hasMany(Province::class, 'psgc_prov', 'psgc_prov');
    }

    public function citymuns()
    {
        return $this->hasMany(Citymuns::class, 'psgc_reg', 'psgc_reg');
    }

    public function barangays()
    {
        return $this->hasMany(Barangay::class, 'psgc_reg', 'psgc_reg');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'reg_name',
                'region',
            ])
            ->logOnlyDirty() // Log only changes
            ->setDescriptionForEvent(fn(string $eventName) => "Region {$eventName}: {$this->reg_name}");
    }
}

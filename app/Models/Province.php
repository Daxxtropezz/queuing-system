<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Province extends Model
{
    use LogsActivity;
    // Table associated with the model (if not default pluralized name)
    protected $table = 'psgc_prov';

    protected $primaryKey = 'psgc_prov';

    // Columns that can be mass-assigned
    protected $fillable = [
        'psgc_reg',
        'psgc_prov',
        'prov_name',
    ];

    public function region()
    {
        return $this->belongsTo(Region::class, 'psgc_reg', 'psgc_reg');
    }

    public function citymuns()
    {
        return $this->hasMany(Citymuns::class, 'psgc_prov', 'psgc_prov');
    }

    public function barangays()
    {
        return $this->hasMany(Barangay::class, 'psgc_prov', 'psgc_prov');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'psgc_reg',
                'psgc_prov',
                'prov_name',
            ])
            ->logOnlyDirty() // Log only changes
            ->setDescriptionForEvent(fn(string $eventName) => "Province information {$eventName} for Province ID: {$this->psgc_prov}");
    }
}

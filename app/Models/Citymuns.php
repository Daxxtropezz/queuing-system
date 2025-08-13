<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Citymuns extends Model
{
    use LogsActivity;

    // Table associated with the model (if not default pluralized name)
    protected $table = 'psgc_mun';

    protected $primaryKey = 'psgc_mun';

    // Columns that can be mass-assigned
    protected $fillable = [
        'psgc_reg',
        'psgc_prov',
        'psgc_mun',
        'mun_name',
    ];
    public function region()
    {
        return $this->belongsTo(Region::class, 'psgc_reg', 'psgc_reg');
    }
    public function province()
    {
        return $this->belongsTo(Province::class, 'psgc_prov', 'psgc_prov');
    }

    public function barangays()
    {
        return $this->hasMany(Barangay::class, 'psgc_mun', 'psgc_mun');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['psgc_reg', 'psgc_prov', 'psgc_mun', 'mun_name'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "City/Municipality {$this->mun_name} has been {$eventName}");
    }
}

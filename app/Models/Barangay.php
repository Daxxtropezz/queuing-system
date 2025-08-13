<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Barangay extends Model
{
    use LogsActivity;
    // Table associated with the model (if not default pluralized name)
    protected $table = 'psgc_brgy';

    protected $primaryKey = 'psgc_brgy';

    // Columns that can be mass-assigned
    protected $fillable = [
        'psgc_reg',
        'psgc_prov',
        'psgc_mun',
        'psgc_brgy',
        'brgy_name',
    ];

    public function region()
    {
        return $this->belongsTo(Region::class, 'psgc_reg', 'psgc_reg');
    }

    public function province()
    {
        return $this->belongsTo(Province::class, 'psgc_prov', 'psgc_prov');
    }

    public function citymun()
    {
        return $this->belongsTo(Citymuns::class, 'psgc_mun', 'psgc_mun');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['psgc_reg', 'psgc_prov', 'psgc_mun', 'psgc_brgy', 'brgy_name'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(
                fn(string $eventName) =>
                "Barangay {$this->brgy_name} has been {$eventName}"
            );
    }
}

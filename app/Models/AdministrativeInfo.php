<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdministrativeInfo extends Model
{
    use HasFactory;

    protected $table = 'tbl_administrative_info';

    protected $primaryKey = 'admin_info_id';

    protected $fillable = [
        'admin_info_id',
        'client_code',
        'incident_no',
        'user_id',
        'lastname',
        'firstname',
        'middlename',
        'ext',
        'position',
        'organization',
        'office_address',
        'informant_name',
        'relationship',
        'contact_no'
    ];
}

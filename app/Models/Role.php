<?php

namespace App\Models;


use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by')->select('id', 'name');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by')->select('id', 'name');
    }
}

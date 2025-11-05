<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            'Step1-Teller',
            'Step2-Teller',
            'Administrator',
            'Guest'
        ];

        foreach ($roles as $role) {
            $roleInstance = Role::firstOrCreate(
                ['name' => $role],
                ['created_by' => 3]
            );

            // Ensure updated_at is NULL if the role was newly created
            if ($roleInstance->wasRecentlyCreated) {
                $roleInstance->update(['updated_at' => null]);
            }
        }

        // Create Permissions
        $permissions = [
            'Step1-Teller',
            'Step2-Teller',
            'Administrator',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }
    }
}

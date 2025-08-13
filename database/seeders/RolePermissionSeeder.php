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
            'BarangayFocal',
            'LGUFocal',
            'ProvincialFocal',
            'RegionalFocal',
            'DSWDFocal',
            'Sectoral',
            'LedSecretariat',
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
            'BarangayFocal',
            'LGUFocal',
            'ProvincialFocal',
            'RegionalFocal',
            'DSWDFocal',
            'Sectoral',
            'LedSecretariat',
            'Administrator',
            'create case',
            'edit case',
            'delete case',
            'create forms',
            'edit forms',
            'delete forms'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Assign Permissions to Roles
        $administrator = Role::where('name', 'Administrator')->first();
        $barangayFocal = Role::where('name', 'BarangayFocal')->first();

        if ($administrator) {
            $administrator->givePermissionTo(['edit case', 'delete case', 'create forms', 'edit forms', 'delete forms']);
        }
        if ($barangayFocal) {
            $barangayFocal->givePermissionTo(['create case', 'create forms']);
        }
    }
}

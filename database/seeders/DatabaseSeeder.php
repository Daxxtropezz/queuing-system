<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call(MaintenanceSeeder::class);
        $this->call(RolePermissionSeeder::class);

        // $this->command->getOutput()->write("\033[H\033[2J");
        // $this->command->info('Importing PSGC...');

        // Artisan::call('import:psgc');

        // $this->command->getOutput()->write("\033[H\033[2J");
        // $this->command->info('PSGC data has been imported successfully.');
    }
}

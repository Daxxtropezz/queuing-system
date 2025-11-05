<?php

namespace Database\Seeders;

use App\Models\Maintenance;
use Illuminate\Database\Seeder;

class MaintenanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $categories = [
            //civil status
            ['category_name' => 'Civil Status', 'category_value' => 'Single'],
            ['category_name' => 'Civil Status', 'category_value' => 'Married'],
            ['category_name' => 'Civil Status', 'category_value' => 'Widowed'],
            ['category_name' => 'Civil Status', 'category_value' => 'Separeted'],
            ['category_name' => 'Civil Status', 'category_value' => 'Common Law Spouse'],

            //sexes
            ['category_name' => 'Sex Category', 'category_value' => 'Male'],
            ['category_name' => 'Sex Category', 'category_value' => 'Female'],
        ];
        
        foreach ($categories as $category) {
            Maintenance::create([
                ...$category,
                'created_by' => '1',
                'updated_by' => '1',
            ]);
        }
    }
}

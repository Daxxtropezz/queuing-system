<?php

namespace App\Http\Controllers;

use App\Models\Barangay;
use App\Models\Citymuns;
use App\Models\Province;
use App\Models\Region;
use Illuminate\Support\Facades\DB;
use League\Csv\Reader;

class PsgcController extends Controller
{
    /**
     * Import all PSGC data (region, province, city/municipality, barangay).
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    // Optimzed importPsgc function
    public function importPsgc()
    {
        $config = [
            'region' => [
                'file' => public_path('csv/psgc_reg.csv'),
                'table' => 'psgc_reg',
                'columns' => ['psgc_reg', 'reg_name', 'region'],
            ],
            'province' => [
                'file' => public_path('csv/psgc_prov.csv'),
                'table' => 'psgc_prov',
                'columns' => ['psgc_prov', 'psgc_reg', 'prov_name'],
            ],
            'citymun' => [
                'file' => public_path('csv/psgc_mun.csv'),
                'table' => 'psgc_mun',
                'columns' => ['psgc_mun', 'psgc_reg', 'psgc_prov', 'mun_name'],
            ],
            'barangay' => [
                'file' => public_path('csv/psgc_brgy.csv'),
                'table' => 'psgc_brgy',
                'columns' => ['psgc_brgy', 'psgc_reg', 'psgc_prov', 'psgc_mun', 'brgy_name'],
            ],
        ];

        $totalInserted = 0;

        foreach ($config as $type => $settings) {
            $filePath = $settings['file'];
            $table = $settings['table'];
            $columns = $settings['columns'];

            if (!file_exists($filePath)) {
                continue;
            }

            $csv = Reader::createFromPath($filePath, 'r');
            $csv->setHeaderOffset(0);

            $records = $csv->getRecords();
            $batchSize = 1000; // Number of records per batch
            $batchData = [];

            // Fetch existing primary keys in bulk
            $primaryKey = $columns[0];
            $existingKeys = DB::table($table)->pluck($primaryKey)->toArray();

            foreach ($records as $record) {
                if (!in_array($record[$primaryKey], $existingKeys)) {
                    $data = [];
                    foreach ($columns as $column) {
                        $data[$column] = $record[$column];
                    }
                    $data['created_at'] = now();
                    $data['updated_at'] = now();

                    $batchData[] = $data;

                    if (count($batchData) >= $batchSize) {
                        // Insert batch
                        DB::table($table)->insert($batchData);
                        $totalInserted += count($batchData);
                        $batchData = [];
                    }
                }
            }

            // Insert remaining records
            if (!empty($batchData)) {
                DB::table($table)->insert($batchData);
                $totalInserted += count($batchData);
            }
        }

        return redirect('/dashboard')->with('success', "Successfully imported a total of {$totalInserted} records across all types!");
    }

    public function getProvinces($regionId)
    {
        $provinces = Province::where('psgc_reg', $regionId)
            ->orderBy('prov_name', 'asc')
            ->get();

        return response()->json($provinces);
    }

    public function getCityMuns($provinceId)
    {
        $citymuns = Citymuns::where('psgc_prov', $provinceId)
            ->orderBy('mun_name', 'asc')
            ->get();

        return response()->json($citymuns);
    }

    public function getBarangays($citymunId)
    {
        $barangays = Barangay::where('psgc_mun', $citymunId)
            ->orderBy('brgy_name', 'asc')
            ->get();

        return response()->json($barangays);
    }
    public function getRegions()
    {
        $regions = Region::all();
        return response()->json($regions);
    }
}

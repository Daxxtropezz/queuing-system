<?php

namespace App\Http\Controllers;

use App\Models\Barangay;
use App\Models\Citymuns;
use App\Models\Province;
use App\Models\Region;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {

        // Fetch all regions (optimized for now)
        $regions = Region::select('psgc_reg', 'reg_name', 'region')->get();

        // Return data to the frontend (only regions for now)
        return Inertia::render('Dashboard', [
            'regions' => $regions,
        ]);
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

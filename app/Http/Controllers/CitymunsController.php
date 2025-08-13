<?php

namespace App\Http\Controllers;

use App\Models\Citymuns;
use App\Models\Province;
use App\Models\Region;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CitymunsController extends Controller
{

public function index(Request $request)
{
    $regions = Region::orderBy('psgc_reg', 'asc')->get();
    $provinces = Province::orderBy('psgc_prov', 'asc')->get();

    // Define sortable columns and their DB mapping
    $sortable = [
        'psgc_mun' => 'psgc_mun',
        'mun_name' => 'mun_name',
        'region.reg_name' => 'regions.reg_name',
        'province.prov_name' => 'provinces.prov_name',
    ];

    $sortBy = $request->input('sort_by', 'psgc_mun');
    $sortDirection = $request->input('sort_direction', 'asc');

    // Start query
    $citymunsQuery = Citymuns::with('region', 'province');

    if ($sortBy === 'region.reg_name') {
    $citymunsQuery->join('psgc_reg', 'psgc_mun.psgc_reg', '=', 'psgc_reg.psgc_reg')
        ->orderBy('psgc_reg.reg_name', $sortDirection)
        ->select('psgc_mun.*');
} elseif ($sortBy === 'province.prov_name') {
    $citymunsQuery->join('psgc_prov', 'psgc_mun.psgc_prov', '=', 'psgc_prov.psgc_prov')
        ->orderBy('psgc_prov.prov_name', $sortDirection)
        ->select('psgc_mun.*');
} elseif (isset($sortable[$sortBy])) {
    $citymunsQuery->orderBy($sortable[$sortBy], $sortDirection);
} else {
    $citymunsQuery->orderBy('psgc_mun', 'asc');
}

// Search
if ($request->has('search')) {
    $search = $request->input('search');
    $citymunsQuery->where(function ($query) use ($search) {
        $query->where('mun_name', 'like', '%' . $search . '%')
            ->orWhereHas('region', function ($q) use ($search) {
                $q->where('reg_name', 'like', '%' . $search . '%');
            })
            ->orWhereHas('province', function ($q) use ($search) {
                $q->where('prov_name', 'like', '%' . $search . '%');
            });
    });
}

    // Paginate the results
    $citymuns = $citymunsQuery->paginate(10);

    return inertia('psgc/citymuns', [
        'regions' => $regions,
        'provinces' => $provinces,
        'citymuns' => $citymuns,
        'filters' => $request->only(['search', 'sort_by', 'sort_direction']),
    ]);
}


    public function store(Request $request)
    {
        $validated = $request->validate([
            'psgc_reg' => ['required', 'integer'],
            'psgc_prov' => ['required', 'integer'],
            'psgc_mun' => ['required', 'integer', 'unique:psgc_mun'],
            'mun_name' => ['required', 'max:255'],
        ]);

        // Check if psgc_mun exceeds the maximum allowed value for INT
        $maxValue = 2147483647;  // Maximum value for INT
        if ($validated['psgc_mun'] > $maxValue) {
            return back()->withErrors([
                'psgc_mun' => 'The Municipality Code is too large. The maximum allowed value is ' . $maxValue . '. Please provide a valid code.',
            ])->withInput();
        }

        // Create the City/Municipality
        Citymuns::create([
            'psgc_reg' => $validated['psgc_reg'],
            'psgc_prov' => $validated['psgc_prov'],
            'psgc_mun' => $validated['psgc_mun'],
            'mun_name' => $validated['mun_name'],
        ]);

        return redirect()->route('citymun.index')->with('success', 'City/Municipality created successfully.');
    }


    public function update(Request $request, Citymuns $citymun)
    {
        $validated = $request->validate([
            'psgc_reg' => 'required',
            'psgc_prov' => 'required',
            'psgc_mun' => 'required',
            'mun_name' => 'required',
        ]);

        $maxValue = 2147483647;  // Maximum value for INT
        if ($validated['psgc_mun'] > $maxValue) {
            return back()->withErrors([
                'psgc_mun' => 'The Municipality Code is too large. The maximum allowed value is ' . $maxValue . '. Please provide a valid code.',
            ])->withInput();
        }

        $newPsgcMun = $validated['psgc_mun'];
        $psgcMunChanged = $citymun->psgc_mun != $newPsgcMun;

        // Prevent updating psgc_mun if it's already referenced in barangays
        if ($psgcMunChanged) {
            // Check if the old psgc_mun is used in barangays (not the new value)
            $isUsedInBrgy = DB::table('psgc_brgy')
                ->where('psgc_mun', $citymun->psgc_mun)  // Check if the current psgc_mun exists in barangays
                ->exists();

            if ($isUsedInBrgy) {
                return back()->withErrors([
                    'psgc_mun' => 'Cannot change Municipality Code because it is already used in barangays.',
                ])->withInput();
            }

            // Check if the new psgc_mun already exists in the database (to prevent duplicates)
            $isDuplicate = DB::table('psgc_mun')
                ->where('psgc_mun', $newPsgcMun)  // Check for duplicate psgc_mun value
                ->where('psgc_mun', '!=', $citymun->psgc_mun)  // Exclude the current psgc_mun value
                ->exists();

            if ($isDuplicate) {
                return back()->withErrors([
                    'psgc_mun' => 'The new Municipality Code already exists. Please choose a unique code.',
                ])->withInput();
            }
        }

        DB::transaction(function () use ($citymun, $validated) {
            // Update the city/municipality record
            $citymun->update($validated);

            // Cascade changes to barangays
            DB::table('psgc_brgy')
                ->where('psgc_mun', $citymun->psgc_mun)
                ->update([
                    'psgc_reg' => $validated['psgc_reg'],
                    'psgc_prov' => $validated['psgc_prov'],
                ]);
        });

        return redirect()
            ->route('citymun.index')
            ->with('success', 'City/Municipality updated successfully.');
    }





    public function destroy($id)
    {
        $citymun = Citymuns::findOrFail($id);

        // Check if city/municipality is referenced in barangays or address tables
        $hasBarangays = DB::table('psgc_brgy')->where('psgc_mun', $citymun->psgc_mun)->exists();
        $usedInBeneficiaries = DB::table('tbl_beneficiary_address')->where('citymun', $citymun->psgc_mun)->exists();
        $usedInClients = DB::table('tbl_client_address')->where('citymun', $citymun->psgc_mun)->exists();
        $usedInServiceProviders = DB::table('tbl_service_providers')->where('citymun', $citymun->psgc_mun)->exists();

        if ($hasBarangays || $usedInBeneficiaries || $usedInClients || $usedInServiceProviders) {
            return back()->withErrors([
                'delete_error' => 'Cannot delete this city/municipality because it is associated with barangays or other related records.',
            ]);
        }

        try {
            $citymun->delete();

            return redirect()->back()->with('success', 'City/municipality deleted successfully.');
        } catch (QueryException $e) {
            if ($e->getCode() == '23000') {
                return back()->withErrors([
                    'delete_error' => 'Cannot delete this city/municipality because it is still referenced by other records.',
                ]);
            }

            return back()->withErrors([
                'delete_error' => 'An unexpected error occurred while deleting the city/municipality.',
            ]);
        }
    }
}

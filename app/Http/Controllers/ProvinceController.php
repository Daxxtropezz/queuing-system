<?php

namespace App\Http\Controllers;

use App\Models\Province;
use App\Models\Region;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProvinceController extends Controller
{
    public function index(Request $request)
{
    $regions = Region::orderBy('psgc_reg', 'asc')->get();

    // Allowed columns for sorting
    $sortable = [
        'psgc_prov' => 'psgc_prov',
        'prov_name' => 'prov_name',
        'region.reg_name' => 'regions.reg_name',
    ];

    $sortBy = $request->input('sort_by', 'psgc_prov');
    $sortDirection = $request->input('sort_direction', 'asc');

    // Start query with join for region sorting if needed
    $provincesQuery = Province::with('region');

    if ($sortBy === 'region.reg_name') {
        $provincesQuery->join('regions', 'provinces.psgc_reg', '=', 'regions.psgc_reg')
            ->orderBy('regions.reg_name', $sortDirection)
            ->select('provinces.*');
    } elseif (isset($sortable[$sortBy])) {
        $provincesQuery->orderBy($sortable[$sortBy], $sortDirection);
    } else {
        $provincesQuery->orderBy('psgc_prov', 'asc');
    }

    // Search
    if ($request->has('search')) {
        $search = $request->input('search');
        $provincesQuery->where(function ($query) use ($search) {
            $query->where('prov_name', 'like', '%' . $search . '%')
                ->orWhereHas('region', function ($regionQuery) use ($search) {
                    $regionQuery->where('reg_name', 'like', '%' . $search . '%');
                });
        });
    }

    $provinces = $provincesQuery->paginate(10);

    return inertia('psgc/provinces', [
        'regions' => $regions,
        'provinces' => $provinces,
        'filters' => $request->only(['search', 'sort_by', 'sort_direction']),
    ]);
}



    public function store(Request $request)
    {
        // Define the maximum allowed value for psgc_prov
        $maxValue = 2147483647;  // Maximum value for INT

        $validated = $request->validate([
            'psgc_reg' => ['required', 'integer'],
            'psgc_prov' => ['required', 'integer', function ($attribute, $value, $fail) use ($maxValue) {
                // Check if the value exceeds the maximum allowed value
                if ($value > $maxValue) {
                    $fail('The ' . $attribute . ' is too large. The maximum allowed value is ' . $maxValue . '. Please provide a valid code.');
                }
            }, 'unique:psgc_prov'],  // Ensure the psgc_prov is unique in the database
            'prov_name' => ['required', 'max:255'],
        ]);

        // Check if psgc_prov already exists
        if (Province::where('psgc_prov', $request->psgc_prov)->exists()) {
            return back()->withErrors([
                'psgc_prov' => 'Province code already exists. Please use a unique code.',
            ])->withInput();
        }

        // Create the new province
        Province::create([
            'psgc_reg' => $request->psgc_reg,
            'psgc_prov' => $request->psgc_prov,
            'prov_name' => $request->prov_name,
        ]);

        return redirect()->route('province.index')->with('success', 'Province created successfully.');
    }

    public function update(Request $request, Province $province)
    {
        // Define the maximum allowed value for psgc_prov
        $maxValue = 2147483647;  // Maximum value for INT

        // Validate the incoming data
        $validated = $request->validate([
            'psgc_reg' => 'required|integer',
            'psgc_prov' => ['required', 'integer', function ($attribute, $value, $fail) use ($maxValue) {
                // Check if the value exceeds the maximum allowed value
                if ($value > $maxValue) {
                    $fail('The ' . $attribute . ' is too large. The maximum allowed value is ' . $maxValue . '. Please provide a valid code.');
                }
            }],
            'prov_name' => 'required|string',
        ]);

        $newPsgcReg = $validated['psgc_reg'];
        $newPsgcProv = $validated['psgc_prov'];
        $psgcRegChanged = $province->psgc_reg != $newPsgcReg;
        $psgcProvChanged = $province->psgc_prov != $newPsgcProv;

        // Prevent changing region code if related municipalities or barangays exist
        if ($psgcRegChanged) {
            $isUsedInMun = DB::table('psgc_mun')
                ->where('psgc_prov', $province->psgc_prov)
                ->exists();

            $isUsedInBrgy = DB::table('psgc_brgy')
                ->where('psgc_prov', $province->psgc_prov)
                ->exists();

            if ($isUsedInMun || $isUsedInBrgy) {
                return back()->withErrors([
                    'psgc_reg' => 'Cannot change Region Code because it is already used in municipalities or barangays.',
                ])->withInput();
            }
        }

        if ($psgcProvChanged) {
            // Check if the new province code already exists
            $duplicateProv = DB::table('psgc_prov')
                ->where('psgc_prov', $newPsgcProv)
                ->exists();

            if ($duplicateProv) {
                return back()->withErrors([
                    'psgc_prov' => 'Province code already exists. Please use a unique code.',
                ])->withInput();
            }

            // Prevent changing province code if related municipalities or barangays exist
            $hasRelatedMuns = DB::table('psgc_mun')
                ->where('psgc_prov', $province->psgc_prov)
                ->exists();

            $hasRelatedBrgys = DB::table('psgc_brgy')
                ->where('psgc_prov', $province->psgc_prov)
                ->exists();

            if ($hasRelatedMuns || $hasRelatedBrgys) {
                return back()->withErrors([
                    'psgc_prov' => 'Cannot change Province Code because it is used in municipalities or barangays.',
                ])->withInput();
            }

            // Check if the province code is used elsewhere (like in beneficiary addresses)
            $isUsedElsewhere = DB::table('tbl_beneficiary_address')
                ->where('province', $province->psgc_prov)
                ->exists();

            if ($isUsedElsewhere) {
                return back()->withErrors([
                    'psgc_prov' => 'Cannot change Province Code because it is already referenced in beneficiary addresses.',
                ])->withInput();
            }
        }

        // Proceed with update
        DB::transaction(function () use ($province, $validated, $psgcRegChanged) {
            // Update the province record
            $province->update($validated);

            // Cascade region update to municipalities and barangays if region code changed
            if ($psgcRegChanged) {
                DB::table('psgc_mun')
                    ->where('psgc_prov', $province->psgc_prov)
                    ->update(['psgc_reg' => $validated['psgc_reg']]);

                DB::table('psgc_brgy')
                    ->where('psgc_prov', $province->psgc_prov)
                    ->update(['psgc_reg' => $validated['psgc_reg']]);
            }
        });

        return redirect()
            ->route('province.index')
            ->with('success', 'Province updated successfully.');
    }



    public function destroy($id)
    {
        $province = Province::findOrFail($id);

        // Check if province is referenced in related tables
        $hasMunicipalities = DB::table('psgc_mun')->where('psgc_prov', $province->psgc_prov)->exists();
        $hasBarangays = DB::table('psgc_brgy')->where('psgc_prov', $province->psgc_prov)->exists();
        $usedInBeneficiaries = DB::table('tbl_beneficiary_address')->where('province', $province->psgc_prov)->exists();
        $usedInClients = DB::table('tbl_client_address')->where('province', $province->psgc_prov)->exists();
        $usedInServiceProviders = DB::table('tbl_service_providers')->where('province', $province->psgc_prov)->exists();

        if ($hasMunicipalities || $hasBarangays || $usedInBeneficiaries || $usedInClients || $usedInServiceProviders) {
            return back()->withErrors([
                'delete_error' => 'Cannot delete this province because it is associated with municipalities, barangays, or other related records.',
            ]);
        }

        try {
            $province->delete();

            return redirect()->back()->with('success', 'Province deleted successfully.');
        } catch (QueryException $e) {
            if ($e->getCode() == '23000') {
                return back()->withErrors([
                    'delete_error' => 'Cannot delete this province because it is still associated with other records.',
                ]);
            }

            return back()->withErrors([
                'delete_error' => 'An unexpected error occurred while deleting the province.',
            ]);
        }
    }
}

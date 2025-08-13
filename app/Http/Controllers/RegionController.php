<?php

namespace App\Http\Controllers;

use App\Models\Region;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class RegionController extends Controller
{
    public function index(Request $request)
    {
        $regionsQuery = Region::query(); // Start with a fresh query builder

        // Handle search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $regionsQuery->where('psgc_reg', 'like', "%{$search}%")
                         ->orWhere('reg_name', 'like', "%{$search}%")
                         ->orWhere('region', 'like', "%{$search}%"); // Assuming 'region' is a column to search on
        }

        // Handle sorting
        // Check if sort_by and sort_direction parameters are provided
        if ($request->filled('sort_by') && $request->filled('sort_direction')) {
            $sortBy = $request->input('sort_by');
            $sortDirection = $request->input('sort_direction');

            // Define a whitelist of sortable columns to prevent SQL injection
            $sortableColumns = [
                'psgc_reg' => 'psgc_reg',
                'reg_name' => 'reg_name',
                'region' => 'region',
                // Add any other column names from your database table that you want to be sortable
            ];

            // Validate that the requested sort_by column is in our whitelist
            // and that the sort_direction is 'asc' or 'desc'
            if (array_key_exists($sortBy, $sortableColumns) && in_array($sortDirection, ['asc', 'desc'])) {
                $regionsQuery->orderBy($sortableColumns[$sortBy], $sortDirection);
            } else {
                // Fallback to default sorting if invalid sort parameters are provided
                $regionsQuery->orderBy('psgc_reg', 'asc');
            }
        } else {
            // Default sorting if no sort parameters are provided at all
            $regionsQuery->orderBy('psgc_reg', 'asc');
        }

        // Paginate the results and append all current query string parameters
        $regions = $regionsQuery->paginate(10)->withQueryString();


        return inertia('psgc/regions', [
            'regions' => $regions,
            // Pass all current filters (search, sort_by, sort_direction) back to the frontend
            'filters' => $request->only(['search', 'sort_by', 'sort_direction']),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }


    public function store(Request $request)
    {
        // Define the maximum allowed value for psgc_reg
        $maxValue = 2147483647;  // Maximum value for INT

        $validated = $request->validate([
            'psgc_reg' => ['required', 'integer', 'unique:psgc_reg', function ($attribute, $value, $fail) use ($maxValue) {
                if ($value > $maxValue) {
                    $fail('The ' . $attribute . ' is too large. The maximum allowed value is ' . $maxValue . '. Please provide a valid code.');
                }
            }],
            'reg_name' => ['required', 'max:255'],
            'region' => ['required', 'max:255'],
        ]);

        Region::create([
            'psgc_reg' => $validated['psgc_reg'],
            'reg_name' => $validated['reg_name'],
            'region' => $validated['region'],
        ]);

        return redirect()->route('region.index')->with('success', 'Region created successfully.');
    }


    public function update(Request $request, Region $region)
    {
        // Define the maximum allowed value for psgc_reg
        $maxValue = 2147483647;  // Maximum value for INT

        // Validate the request
        $validated = $request->validate([
            'psgc_reg' => ['required', 'integer', function ($attribute, $value, $fail) use ($maxValue) {
                // Check if the value exceeds the maximum allowed value
                if ($value > $maxValue) {
                    $fail('The ' . $attribute . ' is too large. The maximum allowed value is ' . $maxValue . '. Please provide a valid code.');
                }
            }],
            'reg_name' => 'required',
            'region' => 'required',
        ]);

        // Check if the region code (psgc_reg) is changing
        $regionCodeChanged = $region->psgc_reg != $validated['psgc_reg'];

        if ($regionCodeChanged) {
            // Check references against the old psgc_reg value
            $isUsedInProv = DB::table('psgc_prov')
                ->where('psgc_reg', $region->psgc_reg)
                ->exists();

            $isUsedInMun = DB::table('psgc_mun')
                ->where('psgc_reg', $region->psgc_reg)
                ->exists();

            $isUsedInBrgy = DB::table('psgc_brgy')
                ->where('psgc_reg', $region->psgc_reg)
                ->exists();

            $isUsedInBeneficiary = DB::table('tbl_beneficiary_address')
                ->where('region', $region->psgc_reg)
                ->exists();

            // Prevent changing psgc_reg if it is already used in other tables
            if ($isUsedInProv || $isUsedInMun || $isUsedInBrgy || $isUsedInBeneficiary) {
                return back()->withErrors([
                    'psgc_reg' => 'Cannot change Region Code because it is already referenced in other tables.',
                ])->withInput();
            }
        }

        // Proceed with the update
        $region->update($validated);

        return redirect()
            ->route('region.index')
            ->with('success', 'Region updated successfully.');
    }


    public function destroy($id)
    {
        $region = Region::findOrFail($id);

        // Check if region is referenced in provinces, municipalities, or barangays
        $hasProvinces = DB::table('psgc_prov')->where('psgc_reg', $region->psgc_reg)->exists();
        $hasMunicipalities = DB::table('psgc_mun')->where('psgc_reg', $region->psgc_reg)->exists();
        $hasBarangays = DB::table('psgc_brgy')->where('psgc_reg', $region->psgc_reg)->exists();

        if ($hasProvinces || $hasMunicipalities || $hasBarangays) {
            return back()->withErrors([
                'delete_error' => 'Cannot delete this region because it is associated with provinces, municipalities, or barangays.',
            ]);
        }

        try {
            $region->delete();

            return redirect()->back()->with('success', 'Region deleted successfully.');
        } catch (QueryException $e) {
            if ($e->getCode() == '23000') {
                return back()->withErrors([
                    'delete_error' => 'Cannot delete this region because it is still associated with other records.',
                ]);
            }

            return back()->withErrors([
                'delete_error' => 'An unexpected error occurred while deleting the region.',
            ]);
        }
    }
}

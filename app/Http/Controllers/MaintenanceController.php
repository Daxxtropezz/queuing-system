<?php

namespace App\Http\Controllers;

use App\Models\Maintenance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MaintenanceController extends Controller
{
        public function index(Request $request)
    {
        // Validate search and sorting input
        $request->validate([
            'search' => 'nullable|string|min:3|max:100|regex:/^[a-zA-Z0-9\s\-_@\.]+$/',
            'sort_by' => 'nullable|string', // Allow any string initially, then validate against whitelist
            'sort_direction' => 'nullable|in:asc,desc', // Only 'asc' or 'desc'
        ]);

        $maintenanceQuery = Maintenance::with(['createdBy', 'updatedBy']);

        // Handle search
        if ($request->filled('search') && strlen($request->search) >= 3) {
            $search = trim($request->input('search'));

            $maintenanceQuery->where(function ($query) use ($search) {
                $query->where('category_name', 'like', '%' . $search . '%')
                    ->orWhere('category_value', 'like', '%' . $search . '%')
                    ->orWhere('category_des', 'like', '%' . $search . '%')
                    ->orWhere('category_module', 'like', '%' . $search . '%');
                // Add search on user names if needed (e.g., by joining or separate query)
                // ->orWhereHas('createdBy', function ($q) use ($search) {
                //     $q->where('first_name', 'like', '%' . $search . '%')
                //       ->orWhere('last_name', 'like', '%' . $search . '%');
                // })
                // ->orWhereHas('updatedBy', function ($q) use ($search) {
                //     $q->where('first_name', 'like', '%' . $search . '%')
                //       ->orWhere('last_name', 'like', '%' . $search . '%');
                // });
            });
        }

        // Handle sorting
        if ($request->filled('sort_by') && $request->filled('sort_direction')) {
            $sortBy = $request->input('sort_by');
            $sortDirection = $request->input('sort_direction');

            // Define a whitelist of sortable columns to prevent SQL injection
            $sortableColumns = [
                'category_name' => 'category_name',
                'category_value' => 'category_value',
                'category_des' => 'category_des',
                'category_module' => 'category_module',
                'created_at' => 'created_at',
                'updated_at' => 'updated_at',
                'created_by.first_name' => 'created_by_user_id',
                'updated_by.first_name' => 'updated_by_user_id',
            ];

            // For sorting by related user names, you'll need to join the tables
            if ($sortBy === 'created_by.first_name') {
                $maintenanceQuery->leftJoin('users as created_users', 'maintenance.created_by_user_id', '=', 'created_users.id')
                                 ->orderBy('created_users.first_name', $sortDirection);
            } elseif ($sortBy === 'updated_by.first_name') {
                $maintenanceQuery->leftJoin('users as updated_users', 'maintenance.updated_by_user_id', '=', 'updated_users.id')
                                 ->orderBy('updated_users.first_name', $sortDirection);
            } elseif (array_key_exists($sortBy, $sortableColumns)) {
                $maintenanceQuery->orderBy($sortableColumns[$sortBy], $sortDirection);
            } else {
                // Fallback to default sorting if invalid sort parameters are provided
                $maintenanceQuery->orderBy('category_name', 'asc');
            }
        } else {
            // Default sorting if no sort parameters are provided
            $maintenanceQuery->orderBy('category_name', 'asc');
        }

        // Paginate with query string preservation
        $maintenance = $maintenanceQuery->paginate(10)->withQueryString();

        return inertia('maintenance', [
            'maintenance' => $maintenance,
            'filters' => $request->only(['search', 'sort_by', 'sort_direction'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_name' => 'required',
            'category_value' => 'required',
            'category_des' => 'nullable',
            'category_module' => 'nullable',
        ]);

        // Normalize nulls to empty strings to match what's stored in DB
        $categoryName = $request->category_name;
        $categoryValue = $request->category_value;
        $categoryDes = $request->category_des ?? '';
        $categoryModule = $request->category_module ?? '';

        $existingRecord = Maintenance::where('category_name', $categoryName)
            ->where('category_value', $categoryValue)
            ->where('category_des', $categoryDes)
            ->where('category_module', $categoryModule)
            ->exists();

        if ($existingRecord) {
            return back()
                ->withInput()
                ->withErrors([
                    'category_name' => 'A record already exists',
                    'category_value' => 'A record already exists.',
                ]);
        }

        Maintenance::create([
            'category_name' => $categoryName,
            'category_value' => $categoryValue,
            'category_des' => $categoryDes,
            'category_module' => $categoryModule,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('maintenance.index')->with('success', 'Maintenance created successfully.');
    }

    public function edit(Maintenance $maintenance)
    {
        return inertia('Maintenance/Edit', ['maintenance' => $maintenance]);
    }

    public function update(Request $request, Maintenance $maintenance)
    {
        // Validate the incoming data
        $validated = $request->validate([
            'category_name' => 'required',
            'category_value' => 'required',
            'category_des' => 'nullable',
            'category_module' => 'nullable',
        ]);

        // Ensure only the ID is stored
        $validated['updated_by'] = Auth::id(); // This stores just the ID
        $validated['updated_at'] = now();

        // Update the maintenance with validated data (Laravel will automatically set updated_at)
        $maintenance->update($validated);

        // Redirect with a success message
        return redirect()
            ->route('maintenance.index')
            ->with('success', 'Maintenance updated successfully.');
    }



    public function destroy(Maintenance $maintenance)
    {
        $maintenance->delete();

        return redirect()->route('maintenance.index')->with('success', 'Maintenance deleted successfully.');
    }
}

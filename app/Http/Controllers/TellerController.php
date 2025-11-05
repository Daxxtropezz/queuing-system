<?php

namespace App\Http\Controllers;

use App\Models\Teller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TellerController extends Controller
{
    public function index(Request $request)
    {
        $query = Teller::query();

        // 1. Get per_page from request, default to 10
        $perPage = $request->input('per_page', 10);
        // Safety check (optional, but recommended)
        $perPage = min(100, max(1, (int) $perPage));

        // Apply search filter if present
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $tellers = $query->orderBy('name')
            // 2. Use the dynamic $perPage variable for pagination
            ->paginate($perPage)
            ->withQueryString();

        return inertia('tellers/index', [
            'tellers' => $tellers,
            'filters' => [
                'search' => $search,
                // 3. Pass per_page back for the UI
                'per_page' => $perPage,
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|max:255',
            'description' => 'nullable|max:255',
        ]);

        $teller = Teller::create($validated);

        // --- Activity Log: Created ---
        activity()
            ->inLog('Teller Management')
            ->performedOn($teller)
            ->causedBy(Auth::user())
            ->event('created')
            ->log('Created a new Teller: ' . $teller->name);
        // -----------------------------

        return redirect()->route('tellers.index')->with('success', 'Teller created.');
    }

    public function update(Request $request, Teller $teller)
    {
        $originalAttributes = $teller->getOriginal();

        $validated = $request->validate([
            'name' => 'required|max:255',
            'description' => 'nullable|max:255',
        ]);

        $teller->update($validated);

        // --- Activity Log: Updated ---
        if ($teller->wasChanged()) {
            activity()
                ->inLog('Teller Management')
                ->performedOn($teller)
                ->causedBy(Auth::user())
                ->event('updated')
                ->withProperty('old', $originalAttributes)
                ->withProperty('new', $teller->getChanges())
                ->log('Updated Teller details: ' . $teller->name);
        }
        // -----------------------------

        return redirect()->route('tellers.index')->with('success', 'Teller updated.');
    }

    public function destroy(Teller $teller)
    {
        // --- Activity Log: About to be deleted ---
        // Log the deletion BEFORE the model is deleted from the database
        activity()
            ->inLog('Teller Management')
            ->performedOn($teller)
            ->causedBy(Auth::user())
            ->event('deleted')
            ->log('Deleted Teller: ' . $teller->name);
        // -----------------------------------------

        $teller->delete();

        return redirect()->back()->with('success', 'Teller deleted.');
    }
}

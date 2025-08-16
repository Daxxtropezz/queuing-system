<?php

namespace App\Http\Controllers;

use App\Models\Teller;
use Illuminate\Http\Request;

class TellerController extends Controller
{
    public function index(Request $request)
    {
        $query = Teller::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('counter_number', 'like', "%{$search}%");
            });
        }

        $tellers = $query->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return inertia('tellers/index', [
            'tellers' => $tellers,
            'filters' => [
                'search' => $search,
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

        Teller::create($validated);

        return redirect()->route('teller-numbers.index')->with('success', 'Teller created.');
    }

    public function update(Request $request, Teller $teller)
    {
        $validated = $request->validate([
            'name' => 'required|max:255',
            'description' => 'nullable|max:255',
        ]);

        $teller->update($validated);

        return redirect()->route('teller-numbers.index')->with('success', 'Teller updated.');
    }

    public function destroy(Teller $teller)
    {
        $teller->delete();

        return redirect()->back()->with('success', 'Teller deleted.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\TransactionType;
use Illuminate\Http\Request;

class TransactionTypeController extends Controller
{
   public function index(Request $request)
{
    $query = TransactionType::query();

    // Apply search filter if present
    if ($search = $request->input('search')) {
        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    $types = $query->orderBy('name')
        ->paginate(10)
        ->withQueryString();

    return inertia('transaction-types/index', [
        'types' => $types,
        'filters' => [
            'search' => $search, // send back current filter for the UI
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
            'name' => 'required|unique:transaction_types,name|max:255',
            'description' => 'nullable|max:255',
        ]);
        TransactionType::create($validated);
        return redirect()->route('transaction-types.index')->with('success', 'Transaction type created.');
    }

    public function update(Request $request, TransactionType $transactionType)
    {
        $validated = $request->validate([
            'name' => 'required|max:255|unique:transaction_types,name,' . $transactionType->id,
            'description' => 'nullable|max:255',
        ]);
        $transactionType->update($validated);
        return redirect()->route('transaction-types.index')->with('success', 'Transaction type updated.');
    }

    public function destroy(TransactionType $transactionType)
    {
        $transactionType->delete();
        return redirect()->back()->with('success', 'Transaction type deleted.');
    }
}

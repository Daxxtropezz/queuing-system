<?php

namespace App\Http\Controllers;

use App\Models\TransactionType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TransactionTypeController extends Controller
{
   public function index(Request $request)
    {
        $query = TransactionType::query();

        // 1. Get per_page from request, default to 10
        $perPage = $request->input('per_page', 10);
        
        // Ensure perPage is a reasonable number, e.g., max 100 for safety
        $perPage = min(100, max(1, (int) $perPage));

        // Apply search filter if present
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $types = $query->orderBy('name')
            // 2. Use the dynamic $perPage variable for pagination
            ->paginate($perPage) 
            ->withQueryString();

        return inertia('transaction-types/index', [
            'types' => $types,
            'filters' => [
                'search' => $search, 
                // 3. Pass per_page back to the frontend filters object
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
            'name' => 'required|unique:transaction_types,name|max:255',
            'description' => 'nullable|max:255',
        ]);
        
        $transactionType = TransactionType::create($validated);

        // --- Activity Log: Created ---
        activity()
            ->inLog('Transaction Types')
            ->performedOn($transactionType)
            ->causedBy(Auth::user()) 
            ->event('created')
            ->log('Created a new transaction type: ' . $transactionType->name);
        // -----------------------------

        return redirect()->route('transaction-types.index')->with('success', 'Transaction type created.');
    }

    public function update(Request $request, TransactionType $transactionType)
    {
        $validated = $request->validate([
            'name' => 'required|max:255|unique:transaction_types,name,' . $transactionType->id,
            'description' => 'nullable|max:255',
        ]);
        
        // Get original attributes for context in the log
        $originalAttributes = $transactionType->getOriginal(); 

        $transactionType->update($validated);

        // --- Activity Log: Updated ---
        // Checks if any attributes were actually changed before logging
        if ($transactionType->wasChanged()) { 
            activity()
                ->inLog('Transaction Types')
                ->performedOn($transactionType)
                ->causedBy(Auth::user())
                ->event('updated')
                ->withProperty('old', $originalAttributes) // Log original data
                ->withProperty('new', $transactionType->getChanges()) // Log only changes
                ->log('Updated transaction type: ' . $transactionType->name);
        }
        // -----------------------------

        return redirect()->route('transaction-types.index')->with('success', 'Transaction type updated.');
    }

    public function destroy(TransactionType $transactionType)
    {
        // --- Activity Log: About to be deleted ---
        activity()
            ->inLog('Transaction Types')
            ->performedOn($transactionType)
            ->event('deleted')
            ->causedBy(Auth::user())
            ->log('Deleted transaction type: ' . $transactionType->name);
        // -----------------------------------------

        $transactionType->delete();

        return redirect()->back()->with('success', 'Transaction type deleted.');
    }
}

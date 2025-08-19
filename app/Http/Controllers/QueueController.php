<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\QueueTicket;
use App\Models\Teller;
use App\Models\TransactionType;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class QueueController extends Controller
{
    // Main page: show tellers and serving numbers
    public function mainPage()
    {
        // Fetch the same data as your JSON endpoint for initial page load
        $serving = QueueTicket::with('transactionType')
            ->where('status', 'serving')
            ->orderByDesc('updated_at')
            ->get();

        $waiting = QueueTicket::with('transactionType')
            ->where('status', 'waiting')
            ->orderBy('created_at')
            ->limit(200)
            ->get();

        $data = QueueTicket::with('transactionType')
            ->select('id', 'number', 'transaction_type_id', 'status', 'served_by', 'teller_id')
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'number' => $ticket->formatted_number,
                    'transaction_type' => $ticket->transactionType->name ?? '',
                    'status' => $ticket->status,
                    'served_by' => $ticket->served_by,
                    'teller_id' => $ticket->teller_id,
                ];
            });


        $boardData = [
            'serving' => $serving,
            'waiting' => $waiting,
            'data' => $data,
            'generated_at' => now()->toIso8601String(),
        ];

        // Also pass current transaction types so the frontend can render columns dynamically
        $transactionTypes = TransactionType::orderBy('name')->get(['id', 'name', 'description']);

        // Pass the data to the Inertia component
        return Inertia::render('queue/main-page', [
            'boardData' => $boardData,
            'transactionTypes' => $transactionTypes,
        ]);
    }

    // Guard page: form to generate number
    public function guardPage()
    {
        $transactionTypes = \App\Models\TransactionType::orderBy('name')->get();
        return inertia('queue/guard-page', [
            'transactionTypes' => $transactionTypes,
        ]);
    }

    // Guard: generate number
    public function generateNumber(Request $request)
    {
        $validated = $request->validate([
            'transaction_type_id' => 'required|exists:transaction_types,id',
            'ispriority' => 'required|in:0,1',
        ]);

        $ticket = null;

        DB::transaction(function () use ($validated, &$ticket) {
            $today = now()->startOfDay();

            // 🔹 Separate counters for Regular (0) and Priority (1)
            $last = QueueTicket::where('transaction_type_id', $validated['transaction_type_id'])
                ->where('ispriority', $validated['ispriority']) // 👈 added this line
                ->whereDate('created_at', $today)
                ->orderByDesc('number')
                ->lockForUpdate()
                ->first();

            $number = $last ? $last->number + 1 : 1;

            $ticket = QueueTicket::create([
                'number' => $number,
                'transaction_type_id' => $validated['transaction_type_id'],
                'status' => 'waiting',
                'ispriority' => $validated['ispriority'],
            ]);
        });

        return response()->json([
            'generatedNumber' => $ticket->formatted_number,
        ]);
    }


    public function status()
    {
        $serving = QueueTicket::with('transactionType')
            ->where('status', 'serving')
            ->orderByDesc('updated_at')
            ->get();

        $waiting = QueueTicket::with('transactionType')
            ->where('status', 'waiting')
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'serving' => $serving,
            'waiting' => $waiting,
        ]);
    }



    // Teller page: show current serving and button to grab next
    public function tellerPage(Request $request)
    {
        $user = $request->user();
        $current = QueueTicket::with('transactionType')
            ->where('served_by', $user->id)
            ->where('status', 'serving')
            ->whereDate('created_at', now())
            ->first();

        // Pass the user's teller number to the frontend
        return Inertia::render('queue/teller-page', [
            'current' => $current,
            'userTellerNumber' => $user->teller_id,
            'transactionTypes' => TransactionType::all(['id', 'name']),
            'tellers' => Teller::all(['id', 'name']),
        ]);
    }

    // New method to handle assigning a teller number to a user
    public function assignTellerNumber(Request $request)
    {
        // $data = $request->all(); // <-- Change this line
        // dd($data);

        $user = $request->user();
        $request->validate([
            'teller_id' => ['required', 'string'],
            'transaction_type_id' => 'required|exists:transaction_types,id',
        ]);

        // Update the authenticated user's teller number
        $user->update([
            'teller_id' => $request->teller_id,
            'transaction_type_id' => $request->transaction_type_id,
        ]);


        // Redirect back to the teller page with the updated state
        return redirect()->route('queue.teller');
    }

    public function grabNumber(Request $request)
{
    $user = $request->user();

    if (is_null($user->teller_id) || is_null($user->transaction_type_id)) {
        return back()->with('error', 'Please select a teller number and transaction type first.');
    }

    // Close old serving tickets (yesterday or earlier)
    QueueTicket::where('served_by', $user->id)
        ->where('status', 'serving')
        ->whereDate('created_at', '<', now()->toDateString())
        ->update(['status' => 'done']);

    $current = QueueTicket::where('served_by', $user->id)
        ->where('status', 'serving')
        ->whereDate('created_at', now()->toDateString())
        ->first();

    if ($current) {
        return back()->with('error', 'Already serving a number');
    }

    $lastServed = QueueTicket::where('served_by', $user->id)
        ->whereIn('status', ['done', 'serving'])
        ->whereDate('created_at', '>=', now()->toDateString()) 
        ->orderByDesc('updated_at')
        ->first();

    $preferredPriority = $lastServed ? ($lastServed->ispriority == 1 ? 0 : 1) : null;

    $query = QueueTicket::where('status', 'waiting')
        ->where('transaction_type_id', $user->transaction_type_id)
        ->whereDate('created_at', '>=', now()->toDateString()); // 👈 today only

    $next = null;
    if (!is_null($preferredPriority)) {
        $next = (clone $query)->where('ispriority', $preferredPriority)->orderBy('id')->first();
    }
    if (!$next) {
        $next = $query->orderBy('ispriority', 'desc')->orderBy('id')->first();
    }

    if ($next) {
        $next->update([
            'status' => 'serving',
            'served_by' => $user->id,
            'teller_id' => $user->teller_id,
        ]);
        return back()->with('success', "Now serving: {$next->formatted_number}");
    }

    return back()->with('error', 'No waiting numbers for your transaction type.');
}

    public function servingIndex()
    {
        $tickets = QueueTicket::where('status', 'serving')->get();
        $userIds = $tickets->pluck('served_by')->filter()->unique();
        $users = $userIds->isEmpty()
            ? collect()
            : User::whereIn('id', $userIds)->get()->keyBy('id');

        $data = $tickets->map(function ($t) use ($users) {
            $u = $users->get($t->served_by);
            return [
                'id' => $t->id,
                'number' => $t->number,
                'transaction_type' => $t->transaction_type,
                'teller' => $u ? ($u->first_name . ' ' . $u->last_name) : null,
                'updated_at' => $t->updated_at?->toIso8601String(),
            ];
        })->values();

        return response()->json(['data' => $data, 'timestamp' => now()->toIso8601String()]);
    }

    public function nextNumber(Request $request)
    {
        $user = $request->user();

        // Mark current ticket as done (today only)
        QueueTicket::where('served_by', $user->id)
            ->where('status', 'serving')
            ->whereDate('created_at', now()) // 👈 today only
            ->update(['status' => 'done']);

        $lastServed = QueueTicket::where('served_by', $user->id)
            ->whereIn('status', ['done', 'serving'])
            ->whereDate('created_at', now()) // 👈 today only
            ->orderByDesc('updated_at')
            ->first();

        $preferredPriority = $lastServed ? ($lastServed->ispriority == 1 ? 0 : 1) : null;

        $query = QueueTicket::where('status', 'waiting')
            ->where('transaction_type_id', $user->transaction_type_id)
            ->whereDate('created_at', now()); // 👈 today only

        $next = null;

        if (!is_null($preferredPriority)) {
            $next = (clone $query)->where('ispriority', $preferredPriority)->orderBy('id')->first();
        }

        if (!$next) {
            $next = $query->orderBy('ispriority', 'desc')->orderBy('id')->first();
        }

        if ($next) {
            $next->update([
                'status' => 'serving',
                'served_by' => $user->id,
                'teller_id' => $user->teller_id,
            ]);

            return back()->with('success', "Now serving: {$next->formatted_number}");
        }

        return back()->with('error', 'No waiting numbers for your transaction type.');
    }
}

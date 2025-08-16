<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\QueueTicket;
use App\Models\User;
use Illuminate\Support\Facades\DB;
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
            ->select('id', 'number', 'transaction_type_id', 'status', 'served_by', 'teller_number')
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'number' => $ticket->formatted_number,
                    'transaction_type' => $ticket->transactionType->name ?? '',
                    'status' => $ticket->status,
                    'served_by' => $ticket->served_by,
                    'teller_number' => $ticket->teller_number,
                ];
            });


        $boardData = [
            'serving' => $serving,
            'waiting' => $waiting,
            'data' => $data,
            'generated_at' => now()->toIso8601String(),
        ];

        // Pass the data to the Inertia component
        return Inertia::render('queue/main-page', [
            'boardData' => $boardData,
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
            $last = QueueTicket::where('transaction_type_id', $validated['transaction_type_id'])
                ->orderByDesc('number')
                ->lockForUpdate()
                ->first();

            $number = $last ? $last->number + 1 : 1;

            $ticket = QueueTicket::create([
                'number' => $number,
                'transaction_type_id' => $validated['transaction_type_id'],
                'status' => 'waiting',
                'ispriority' => $validated['ispriority'] ?? 0,
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
            ->where('status', 'serving')->first();

        // Pass the user's teller number to the frontend
        return Inertia::render('queue/teller-page', [
            'current' => $current,
            'userTellerNumber' => $user->teller_number, // Pass this to the frontend
        ]);
    }

    // New method to handle assigning a teller number to a user
    public function assignTellerNumber(Request $request)
    {
        // $data = $request->all(); // <-- Change this line
        // dd($data);

        $user = $request->user();
        $request->validate([
            'teller_number' => ['required', 'string'],
        ]);

        // Update the authenticated user's teller number
        $user->update(['teller_number' => $request->teller_number]);


        // Redirect back to the teller page with the updated state
        return redirect()->route('queue.teller');
    }

    // Modify your existing grabNumber method
    public function grabNumber(Request $request)
    {
        $user = $request->user();

        // Check if the user has a teller number before proceeding
        if (is_null($user->teller_number)) {
            return back()->with('error', 'Please select a teller number first.');
        }

        $current = QueueTicket::where('served_by', $user->id)->where('status', 'serving')->first();

        if ($current) {
            return back()->with('error', 'Already serving a number');
        }

        $next = QueueTicket::where('status', 'waiting')->orderBy('id')->first();

        if ($next) {
            $next->update([
                'status' => 'serving',
                'served_by' => $user->id,
                'teller_number' => $user->teller_number, // Use the teller number from the user model
            ]);

            return back()->with('success', "Now serving: {$next->number}");
        }

        return back()->with('error', 'No waiting numbers');
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

        // Mark current ticket as done
        QueueTicket::where('served_by', $user->id)
            ->where('status', 'serving')
            ->update(['status' => 'done']);

        // Fetch the next waiting ticket
        $next = QueueTicket::where('status', 'waiting')
            ->orderBy('id')
            ->first();

        if ($next) {
            $next->update([
                'status' => 'serving',
                'served_by' => $user->id,
            ]);

            return back()->with('success', "Now serving: {$next->formatted_number}");
        }

        return back()->with('error', 'No waiting numbers at the moment.');
    }
}

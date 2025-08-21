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
        $serving = QueueTicket::with('transactionType')
            ->where('status', 'serving')
            ->where('step', 1) // <-- only step 1
            ->whereNull('transaction_type_id') // <-- only records without a transaction type
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

        $transactionTypes = TransactionType::orderBy('name')->get(['id', 'name', 'description']);

        return Inertia::render('queue/main-page', [
            'boardData' => $boardData,
            'transactionTypes' => $transactionTypes,
        ]);
    }

    public function servingPage2()
    {
        $serving = QueueTicket::with('transactionType')
            ->where('status', 'serving')
            ->where('step', 1) // <-- only step 1
            ->whereNull('transaction_type_id') // <-- only records without a transaction type
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

        $transactionTypes = TransactionType::orderBy('name')->get(['id', 'name', 'description']);

        return Inertia::render('queue/serving-board', [
            'boardData' => $boardData,
            'transactionTypes' => $transactionTypes,
        ]);
    }

    public function guardPage()
    {
        $transactionTypes = TransactionType::orderBy('name')->get();
        return inertia('queue/guard-page', [
            'transactionTypes' => $transactionTypes,
        ]);
    }

    public function generateNumber(Request $request)
    {
        $validated = $request->validate([
            'ispriority' => 'required|in:0,1',
        ]);

        $ticket = null;

        DB::transaction(function () use ($validated, &$ticket) {
            $today = now()->startOfDay();

            $last = QueueTicket::where('ispriority', $validated['ispriority'])
                ->whereDate('created_at', $today)
                ->orderByDesc('number')
                ->lockForUpdate()
                ->first();

            $number = $last ? $last->number + 1 : 1;

            $ticket = QueueTicket::create([
                'number' => $number,
                'transaction_type_id' => null, // ✅ no longer needed
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

    public function tellerPage(Request $request)
    {
        $user = $request->user();
        $current = QueueTicket::with('transactionType')
            ->where('served_by', $user->id)
            ->where('status', 'serving')
            ->whereDate('created_at', now())
            ->first();

        $waiting_list = QueueTicket::with('transactionType')
            ->where('status', 'waiting')
            ->orderBy('created_at')
            ->limit(200)
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'number' => $ticket->formatted_number,
                    'transaction_type' => [
                        'name' => $ticket->transactionType->name ?? '',
                    ],
                    'status' => $ticket->status,
                    'is_priority' => (bool) $ticket->ispriority,
                ];
            });

        return Inertia::render('queue/teller-page', [
            'current' => $current,
            'userTellerNumber' => $user->teller_id,
            'transactionTypes' => TransactionType::all(['id', 'name']),
            'tellers' => Teller::all(['id', 'name']),
            'waiting_list' => $waiting_list,
        ]);
    }

    public function assignTellerNumber(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'teller_id' => ['required', 'string'],
            'transaction_type_id' => 'required|exists:transaction_types,id',
            'ispriority' => 'required|in:0,1', // ✅ Added
        ]);

        $user->update([
            'teller_id' => $request->teller_id,
            'transaction_type_id' => $request->transaction_type_id,
            'ispriority' => $request->ispriority, // ✅ Added
        ]);

        return redirect()->route('queue.teller');
    }

    public function grabNumber(Request $request)
    {
        $user = $request->user();

        if (is_null($user->teller_id) || is_null($user->transaction_type_id) || is_null($user->ispriority)) {
            return back()->with('error', 'Please select a teller number, transaction type, and status first.');
        }

        // End any expired serving
        QueueTicket::where('served_by', $user->id)
            ->where('status', 'serving')
            ->whereDate('created_at', '<', now()->toDateString())
            ->update(['status' => 'done']);

        // Check if teller already has active
        $current = QueueTicket::where('served_by', $user->id)
            ->where('status', 'serving')
            ->whereDate('created_at', now()->toDateString())
            ->first();

        if ($current) {
            return back()->with('error', 'Already serving a number');
        }

        // ✅ Strict: must match teller’s transaction type AND priority
        $next = QueueTicket::where('status', 'waiting')
            ->where('transaction_type_id', $user->transaction_type_id)
            ->where('ispriority', $user->ispriority)
            ->whereDate('created_at', now())
            ->orderBy('id')
            ->first();

        if ($next) {
            $next->update([
                'status' => 'serving',
                'served_by' => $user->id,
                'teller_id' => $user->teller_id,
                'started_at' => now(),
            ]);
            return back()->with('success', "Now serving: {$next->formatted_number}");
        }

        return back()->with([
            'error' => 'No waiting numbers available for your type and status.',
            'reset_teller' => true
        ]);
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

        if (is_null($user->teller_id) || is_null($user->transaction_type_id) || is_null($user->ispriority)) {
            return back()->with('error', 'Please select a teller number, transaction type, and status first.');
        }

        // Mark current serving as done
        QueueTicket::where('served_by', $user->id)
            ->where('status', 'serving')
            ->whereDate('created_at', now())
            ->update(['status' => 'done', 'finished_at' => now()]);

        // ✅ Strict filter: must match teller’s transaction type AND priority
        $next = QueueTicket::where('status', 'waiting')
            ->where('transaction_type_id', $user->transaction_type_id)
            ->where('ispriority', $user->ispriority)
            ->whereDate('created_at', now())
            ->orderBy('id')
            ->first();

        if ($next) {
            $next->update([
                'status' => 'serving',
                'served_by' => $user->id,
                'teller_id' => $user->teller_id,
                'started_at' => now(),
            ]);

            return back()->with('success', "Now serving: {$next->formatted_number}");
        }

        return back()->with('error', 'No waiting numbers available for your type and status.');
    }

    public function overrideNumber(Request $request)
    {
        $user = $request->user();

        if (is_null($user->teller_id) || is_null($user->transaction_type_id) || is_null($user->ispriority)) {
            return back()->with('error', 'Please select a teller number, transaction type, and status first.');
        }

        // Mark current serving as no_show
        QueueTicket::where('served_by', $user->id)
            ->where('status', 'serving')
            ->whereDate('created_at', now())
            ->update(['status' => 'no_show', 'finished_at' => now()]);

        // ✅ Strict filter: must match teller’s transaction type AND priority
        $next = QueueTicket::where('status', 'waiting')
            ->where('transaction_type_id', $user->transaction_type_id)
            ->where('ispriority', $user->ispriority)
            ->whereDate('created_at', now())
            ->orderBy('id')
            ->first();

        if ($next) {
            $next->update([
                'status' => 'serving',
                'served_by' => $user->id,
                'teller_id' => $user->teller_id,
                'started_at' => now(),
            ]);

            return back()->with('success', "Client skipped. Now serving: {$next->formatted_number}");
        }

        return back()->with('error', 'No waiting numbers available for your type and status.');
    }


    public function resetTeller(Request $request)
    {
        $user = $request->user();

        $user->update([
            'teller_id' => null,
            'transaction_type_id' => null,
            'ispriority' => 0,
        ]);

        return back()->with('success', 'Teller setup has been reset. Please select again.');
    }

    // Step1: Teller Page
    public function tellerStep1Page(Request $request)
    {
        $user = $request->user();

        // Current ticket being served by this user (step1 flow)
        $current = QueueTicket::with('transactionType')
            ->where('served_by', $user->id)
            ->where('status', 'serving')
            ->whereDate('created_at', now())
            ->first();

        $waiting_list = QueueTicket::with('transactionType')
            ->where('status', 'waiting')
            ->whereDate('created_at', now())
            ->orderBy('created_at')
            ->limit(200)
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'number' => $ticket->formatted_number,
                    'status' => $ticket->status,
                    'is_priority' => (bool) $ticket->ispriority,
                ];
            })->values();

            $no_show_list = QueueTicket::with('transactionType')
    ->where('status', 'no_show')
    ->whereDate('created_at', now())
    ->orderBy('updated_at', 'desc')
    ->limit(50)
    ->get()
    ->map(function ($ticket) {
        return [
            'id' => $ticket->id,
            'number' => $ticket->formatted_number,
            'status' => $ticket->status,
        ];
    });

        return Inertia::render('queue/teller-page-step-one', [
            'userTellerNumber' => $user->teller_id,
            'transactionTypes' => TransactionType::all(['id', 'name']),
            'tellers' => Teller::all(['id', 'name']),
            'current' => $current ? [
                'id' => $current->id,
                'number' => $current->formatted_number,
                'ispriority' => $current->ispriority,
                'transaction_type' => $current->transactionType->name ?? '',
            ] : null,
            'waiting_list' => $waiting_list,
             'no_show_list' => $no_show_list, 
        ]);
    }

    // Step1: Grab next waiting ticket (no longer requires user->teller_id to be set)
    public function grabStep1Number(Request $request)
    {
        $request->validate([
            'ispriority' => 'nullable|in:0,1',
        ]);

        $user = $request->user();

        // Check if teller already has active
        $current = QueueTicket::where('served_by', $user->id)
            ->where('status', 'serving')
            ->whereDate('created_at', now())
            ->first();

        if ($current) {
            return back()->with('error', 'Already serving a number');
        }

        $ispriority = $request->input('ispriority', 0);

        $next = QueueTicket::where('status', 'waiting')
            ->where('ispriority', $ispriority)
            ->whereDate('created_at', now())
            ->orderBy('id')
            ->first();

        if ($next) {
            $next->update([
                'status' => 'serving',
                'served_by' => $user->id,
                'teller_id' => $user->teller_id, // attach teller if available (nullable)
                'started_at' => now(),
            ]);

            return back()->with('success', "Now serving: {$next->formatted_number}");
        }

        return back()->with('error', 'No customers found for this status.')->with('confirm_reset', true);
    }

    // Step1: Complete current serving and get next
    public function nextStep1Number(Request $request)
    {
        $user = $request->user();

        // Current ticket being served by this teller
        $current = QueueTicket::where('served_by', $user->id)
            ->where('status', 'serving')
            ->whereDate('created_at', now())
            ->first();

        $ispriority = $current ? $current->ispriority : ($request->input('ispriority', 0));

        if ($current) {
            $current->update([
                'status' => 'done',
                'finished_at' => now(),
                'transaction_type_id' => $request->input('transaction_type_id', $current->transaction_type_id),
                'remarks' => $request->input('remarks', $current->remarks),
            ]);
        }

        // Next ticket matching the same priority
        $next = QueueTicket::where('status', 'waiting')
            ->where('ispriority', $ispriority)
            ->whereDate('created_at', now())
            ->orderBy('id')
            ->first();

        if ($next) {
            $next->update([
                'status' => 'serving',
                'served_by' => $user->id,
                'teller_id' => $user->teller_id,
                'started_at' => now(),
                // optional: prefill transaction type and remarks if you want
                'transaction_type_id' => $next->transaction_type_id ?? $request->input('transaction_type_id'),
                'remarks' => $next->remarks ?? '',
            ]);

            return back()->with('success', "Now serving: {$next->formatted_number}");
        }

        return back()->with('error', 'No customers found for this status.')->with('confirm_reset', true);
    }

    // Step1: Mark current as no_show and get next
    public function overrideStep1Number(Request $request)
    {
        $user = $request->user();

        $current = QueueTicket::where('served_by', $user->id)
            ->where('status', 'serving')
            ->whereDate('created_at', now())
            ->first();

        $ispriority = $current ? $current->ispriority : ($request->input('ispriority', 0));

        if ($current) {
            $current->update([
                'status' => 'no_show',
                'finished_at' => now(),
                'transaction_type_id' => $request->input('transaction_type_id', $current->transaction_type_id),
                'remarks' => $request->input('remarks', $current->remarks),
            ]);
        }

        $next = QueueTicket::where('status', 'waiting')
            ->where('ispriority', $ispriority)
            ->whereDate('created_at', now())
            ->orderBy('id')
            ->first();

        if ($next) {
            $next->update([
                'status' => 'serving',
                'served_by' => $user->id,
                'teller_id' => $user->teller_id,
                'started_at' => now(),
                'transaction_type_id' => $next->transaction_type_id ?? $request->input('transaction_type_id'),
                'remarks' => $next->remarks ?? '',
            ]);

            return back()->with('success', "Now serving: {$next->formatted_number}");
        }

        return back()->with('error', 'No customers found for this status.')->with('confirm_reset', true);
    }

    public function manualOverrideStep1Number(Request $request)
{
    $user = $request->user();

    $request->validate([
        'number' => 'required|string',
        'ispriority' => 'required|in:0,1',
    ]);

    $requestedNumber = (int) preg_replace('/[^0-9]/', '', $request->input('number'));
    
    // Convert the ispriority string to a boolean for a more robust check.
    $ispriorityBool = filter_var($request->input('ispriority'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

    $ticket = QueueTicket::where('number', $requestedNumber)
        ->where('ispriority', $ispriorityBool)
        ->whereDate('created_at', now())
        ->first();

    if (!$ticket) {
        // ⬅️ Flash message for "not found"
        return back()->with('no_found', 'Ticket not found for today with the given status/priority.');
    }
    
    // Check if the ticket is already serving or done
    if ($ticket->status === 'serving' || $ticket->status === 'done') {
        return back()->with('error', "Ticket is already {$ticket->status}.");
    }

    // New logic: Check if the ticket is in a "no_show" state and handle that specifically
    if ($ticket->status === 'no_show') {
        // You can choose to re-serve the "no_show" ticket
        // Or you can prevent it and send a different message.
        // For this example, let's allow re-serving but with a warning message.
        $currentServing = QueueTicket::where('served_by', $user->id)
            ->where('status', 'serving')
            ->whereDate('created_at', now())
            ->first();

        if ($currentServing) {
            $currentServing->update(['status' => 'done', 'finished_at' => now()]);
        }

        $ticket->update([
            'status' => 'serving',
            'served_by' => $user->id,
            'teller_id' => $user->teller_id,
            'started_at' => now(),
        ]);
        
        // ⬅️ Flash message for "no show" override
        return back()->with('no_show', "Successfully re-serving 'No Show' client: {$ticket->formatted_number}");

    }

    // End current if serving
    $currentServing = QueueTicket::where('served_by', $user->id)
        ->where('status', 'serving')
        ->whereDate('created_at', now())
        ->first();

    if ($currentServing) {
        $currentServing->update(['status' => 'done', 'finished_at' => now()]);
    }

    // Serve the chosen ticket
    $ticket->update([
        'status' => 'serving',
        'served_by' => $user->id,
        'teller_id' => $user->teller_id,
        'started_at' => now(),
    ]);

    // ⬅️ Flash message for success
    return back()->with('success', "Now serving client: {$ticket->formatted_number}");
}

public function serveNoShow(Request $request)
{
    $user = $request->user();
    $ticket = QueueTicket::where('id', $request->id)
        ->where('status', 'no_show')
        ->whereDate('created_at', now())
        ->first();

    if (!$ticket) {
        return back()->with('error', 'No show ticket not found.');
    }

    // End any current serving
    QueueTicket::where('served_by', $user->id)
        ->where('status', 'serving')
        ->update(['status' => 'done', 'finished_at' => now()]);

    $ticket->update([
        'status' => 'serving',
        'served_by' => $user->id,
        'teller_id' => $user->teller_id,
        'started_at' => now(),
    ]);

    return back()->with('success', "Now serving no show: {$ticket->formatted_number}");
}

        return back()->with('error', 'No customers found for this status.')->with('confirm_reset', true);
    }
}

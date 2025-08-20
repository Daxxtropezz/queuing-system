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
            'transaction_type_id' => 'required|exists:transaction_types,id',
            'ispriority' => 'required|in:0,1',
        ]);

        $ticket = null;

        DB::transaction(function () use ($validated, &$ticket) {
            $today = now()->startOfDay();

            $last = QueueTicket::where('transaction_type_id', $validated['transaction_type_id'])
                ->where('ispriority', $validated['ispriority'])
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

    public function tellerPage(Request $request)
    {
        $user = $request->user();
        $current = QueueTicket::with('transactionType')
            ->where('served_by', $user->id)
            ->where('status', 'serving')
            ->whereDate('created_at', now())
            ->first();

        return Inertia::render('queue/teller-page', [
            'current' => $current,
            'userTellerNumber' => $user->teller_id,
            'transactionTypes' => TransactionType::all(['id', 'name']),
            'tellers' => Teller::all(['id', 'name']),
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

    // ❌ Nothing left → reset teller setup
    $user->update([
        'teller_id' => null,
        'transaction_type_id' => null,
        'ispriority' => 0, // fallback to Regular since NOT NULL
    ]);

    return back()->with('error', 'No waiting numbers available. Please select transaction type and status again.');
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
        ->update([
            'status' => 'done',
            'finished_at' => now(),
        ]);

    // Try to get the next ticket for this teller setup
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

    // ❌ Nothing left → reset teller setup
    $user->update([
        'teller_id' => null,
        'transaction_type_id' => null,
        'ispriority' => 0,
    ]);

    return back()
        ->with('reset_teller', true) // 👈 triggers reset on frontend
        ->with('error', 'No more customers for your current setup. Please select again.');
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

    // Try next ticket
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

    // ❌ Nothing left → reset setup
    $user->update([
        'teller_id' => null,
        'transaction_type_id' => null,
        'ispriority' => 0,
    ]);

    return back()->with('error', 'No more customers for your current setup. Please select again.');
}


}

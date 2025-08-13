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
    $serving = QueueTicket::select('id', 'number', 'transaction_type_id', 'status', 'served_by', 'created_at', 'updated_at')
        ->where('status', 'serving')
        ->orderByDesc('updated_at')
        ->get();

    $waiting = QueueTicket::select('id', 'number', 'transaction_type_id', 'status', 'served_by', 'created_at', 'updated_at')
        ->where('status', 'waiting')
        ->orderBy('created_at')
        ->limit(200)
        ->get();

    $boardData = [
        'serving' => $serving,
        'waiting' => $waiting,
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
        $request->validate([
            'transaction_type_id' => 'required|exists:transaction_types,id',
        ]);

        $ticket = null;

        DB::transaction(function () use ($request, &$ticket) {
            $last = QueueTicket::where('transaction_type_id', $request->transaction_type_id)
                ->orderByDesc('number')
                ->lockForUpdate()
                ->first();

            $number = $last ? $last->number + 1 : 1;

            $ticket = QueueTicket::create([
                'number' => $number,
                'transaction_type_id' => $request->transaction_type_id,
                'status' => 'waiting',
            ]);
        });

        return redirect()
            ->route('queue.guard')
            ->with('success', "Your number: {$ticket->number}");
    }


    // Teller page: show current serving and button to grab next
    public function tellerPage(Request $request)
    {
        $user = $request->user();
        $current = QueueTicket::where('served_by', $user->id)
            ->where('status', 'serving')->first();
        return Inertia::render('queue/teller-page', ['current' => $current]);
    }

    // Teller: grab next number
    public function grabNumber(Request $request)
    {
        $user = $request->user();
        $current = QueueTicket::where('served_by', $user->id)
            ->where('status', 'serving')->first();
        if ($current) {
            // Already serving
            return back()->with('error', 'Already serving a number');
        }
        $next = QueueTicket::where('status', 'waiting')->orderBy('id')->first();
        if ($next) {
            $next->update([
                'status' => 'serving',
                'served_by' => $user->id,
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

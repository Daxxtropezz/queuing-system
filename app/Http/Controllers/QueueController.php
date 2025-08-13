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
        $tellers = User::role('Teller')->get();
        $serving = [];
        foreach ($tellers as $teller) {
            $ticket = QueueTicket::where('served_by', $teller->id)
                ->where('status', 'serving')
                ->first();
            $serving[] = [
                'id' => $ticket ? $ticket->id : ('teller-' . $teller->id), // ensure unique key for frontend
                'teller' => $teller->first_name . ' ' . $teller->last_name,
                'number' => $ticket ? $ticket->number : null,
                'transaction_type' => $ticket ? $ticket->transaction_type : null,
            ];
        }
        return Inertia::render('queue/main-page', ['serving' => $serving]);
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
            'transaction_type' => 'required|string',
        ]);

        $ticket = null;

        DB::transaction(function () use ($request, &$ticket) {
            $last = QueueTicket::where('transaction_type', $request->transaction_type)
                ->orderByDesc('number')
                ->lockForUpdate()
                ->first();

            $number = $last ? $last->number + 1 : 1;

            $ticket = QueueTicket::create([
                'number' => $number,
                'transaction_type' => $request->transaction_type,
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
        // Collect all currently serving tickets with teller info
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
}

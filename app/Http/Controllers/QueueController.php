<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\QueueTicket;
use App\Models\User;
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
                'teller' => $teller->first_name . ' ' . $teller->last_name,
                'number' => $ticket ? $ticket->number : null,
                'transaction_type' => $ticket ? $ticket->transaction_type : null,
            ];
        }
        return Inertia::render('queue/MainPage', ['serving' => $serving]);
    }

    // Guard page: form to generate number
    public function guardPage()
    {
        return Inertia::render('queue/GuardPage');
    }

    // Guard: generate number
    public function generateNumber(Request $request)
    {
        $request->validate([
            'transaction_type' => 'required|string',
        ]);
        $last = QueueTicket::where('transaction_type', $request->transaction_type)
            ->orderByDesc('number')->first();
        $number = $last ? $last->number + 1 : 1;
        $ticket = QueueTicket::create([
            'number' => $number,
            'transaction_type' => $request->transaction_type,
            'status' => 'waiting',
        ]);
        return redirect()->route('queue.guard')->with('success', "Your number: {$ticket->number}");
    }

    // Teller page: show current serving and button to grab next
    public function tellerPage(Request $request)
    {
        $user = $request->user();
        $current = QueueTicket::where('served_by', $user->id)
            ->where('status', 'serving')->first();
        return Inertia::render('queue/TellerPage', ['current' => $current]);
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
}

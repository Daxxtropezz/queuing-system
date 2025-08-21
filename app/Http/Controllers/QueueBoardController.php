<?php

namespace App\Http\Controllers;

use App\Models\QueueTicket;
use Illuminate\Http\Request;
use Carbon\Carbon;

class QueueBoardController extends Controller
{
    public function data(Request $request)
    {
        // only include tickets created today
        $today = Carbon::today();

        $serving = QueueTicket::with('transactionType:id,name')
            ->select('id', 'number', 'transaction_type_id', 'status', 'served_by', 'teller_id', 'ispriority', 'created_at', 'updated_at')
            ->where('status', 'serving')
            ->where('step', 1) // <-- only step 1
            ->whereNull('transaction_type_id') // <-- only records without a transaction type
            ->whereDate('created_at', $today)
            ->orderByDesc('updated_at')
            ->get();

        $waiting = QueueTicket::with('transactionType:id,name')
            ->select('id', 'number', 'transaction_type_id', 'status', 'served_by', 'teller_id', 'ispriority', 'created_at', 'updated_at')
            ->where('status', 'waiting')
            ->whereDate('created_at', $today)
            ->orderBy('created_at')
            ->limit(200)
            ->get();

        $data = QueueTicket::with('transactionType:id,name')
            ->select('id', 'number', 'transaction_type_id', 'status', 'served_by', 'teller_id', 'ispriority', 'created_at')
            ->whereDate('created_at', $today)
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'number' => $ticket->formatted_number,
                    'transaction_type' => ['name' => $ticket->transactionType->name ?? ''],
                    'ispriority' => $ticket->ispriority ?? 0,
                    'status' => $ticket->status,
                    'served_by' => $ticket->served_by,
                    'teller_id' => $ticket->teller_id,
                    'created_at' => $ticket->created_at?->toIso8601String(),
                ];
            });

        return response()
            ->json([
                'serving' => $serving,
                'waiting' => $waiting,
                'data' => $data,
                'generated_at' => now()->toIso8601String(),
            ])
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }
}

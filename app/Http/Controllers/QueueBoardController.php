<?php

namespace App\Http\Controllers;

use App\Models\QueueTicket;
use Illuminate\Http\Request;

class QueueBoardController extends Controller
{
    public function data(Request $request)
    {
        $serving = QueueTicket::with('transactionType:id,name')
            ->select('id', 'number', 'transaction_type_id', 'status', 'served_by', 'teller_id', 'ispriority', 'created_at', 'updated_at')
            ->where('status', 'serving')
            ->orderByDesc('updated_at')
            ->get();

        $waiting = QueueTicket::with('transactionType:id,name')
            ->select('id', 'number', 'transaction_type_id', 'status', 'served_by', 'teller_id', 'ispriority', 'created_at', 'updated_at')
            ->where('status', 'waiting')
            ->orderBy('created_at')
            ->limit(200)
            ->get();

        $data = QueueTicket::with('transactionType')
            ->select('id', 'number', 'transaction_type_id', 'status', 'served_by', 'teller_id', 'ispriority')
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'number' => $ticket->formatted_number,
                    'transaction_type' => $ticket->transactionType->name ?? '',
                    'ispriority' => $ticket->ispriority ?? 0,
                    'status' => $ticket->status,
                    'served_by' => $ticket->served_by,
                    'teller_id' => $ticket->teller_id,
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

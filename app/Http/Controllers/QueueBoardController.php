<?php

namespace App\Http\Controllers;

use App\Models\QueueTicket;
use Illuminate\Http\Request;

class QueueBoardController extends Controller
{
    public function data(Request $request)
    {
        // Serving tickets (latest first)
        $serving = QueueTicket::select('id', 'number', 'transaction_type_id', 'status', 'served_by', 'created_at', 'updated_at')
            ->where('status', 'serving')
            ->orderByDesc('updated_at')
            ->get();

        // Waiting tickets (oldest first, limit to avoid huge payload)
        $waiting = QueueTicket::select('id', 'number', 'transaction_type_id', 'status', 'served_by', 'created_at', 'updated_at')
            ->where('status', 'waiting')
            ->orderBy('created_at')
            ->limit(200)
            ->get();

        return response()->json([
            'serving' => $serving,
            'waiting' => $waiting,
            'generated_at' => now()->toIso8601String(),
        ]);
    }
}

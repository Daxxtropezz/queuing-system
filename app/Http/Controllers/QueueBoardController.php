<?php

namespace App\Http\Controllers;

use App\Models\QueueTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class QueueBoardController extends Controller
{
    /**
     * Return board data used by the frontend serving/waiting boards.
     */
    public function data(Request $request): JsonResponse
    {
        // only include tickets created today
        $today = Carbon::today();

        // Serving: only tickets where status = 'serving' AND step = 1
        $servingRaw = QueueTicket::with('transactionType:id,name')
            ->select('id', 'number', 'transaction_type_id', 'status', 'served_by', 'teller_id', 'ispriority', 'step', 'created_at', 'updated_at')
            ->where('status', 'serving')
            ->whereDate('created_at', $today)
            ->orderByDesc('updated_at')
            ->get();

        // Waiting: keep existing behavior (example: status = 'waiting')
        $waitingRaw = QueueTicket::with('transactionType:id,name')
            ->select('id', 'number', 'transaction_type_id', 'status', 'served_by', 'teller_id', 'ispriority', 'step', 'created_at', 'updated_at')
            ->where('status', 'waiting')
            ->whereDate('created_at', $today)
            ->orderBy('created_at')
            ->limit(100)
            ->get();

        $mapTicket = function ($ticket) {
            return [
                'id' => $ticket->id,
                'number' => $ticket->formatted_number ?? $ticket->number,
                'transaction_type' => ['name' => $ticket->transactionType->name ?? ''],
                'ispriority' => $ticket->ispriority ?? 0,
                'status' => $ticket->status,
                'served_by' => $ticket->served_by,
                'teller_id' => $ticket->teller_id,
                'step' => $ticket->step ?? null,
                'created_at' => $ticket->created_at ? $ticket->created_at->format(DATE_ATOM) : null,
                'updated_at' => $ticket->updated_at ? $ticket->updated_at->format(DATE_ATOM) : null,
            ];
        };

        $serving = $servingRaw->map($mapTicket)->values();
        $waiting = $waitingRaw->map($mapTicket)->values();

        // Optional full data payload (kept for compatibility)
        $data = QueueTicket::with('transactionType:id,name')
            ->select('id', 'number', 'transaction_type_id', 'status', 'served_by', 'teller_id', 'ispriority', 'step', 'created_at', 'updated_at')
            ->whereDate('created_at', $today)
            ->get()
            ->map($mapTicket);

        return response()
            ->json([
                'serving' => $serving,
                'waiting' => $waiting,
                'data' => $data,
                'generated_at' => now()->format(DATE_ATOM),
            ])
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }
}

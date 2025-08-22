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

        // allow the caller to request a specific step (defaults to 1)
        $step = (int) $request->query('step', 1);

        // Serving: tickets where status = 'serving' and match the requested step
        $servingQuery = QueueTicket::with('transactionType:id,name')
            ->select('id', 'number', 'transaction_type_id', 'status', 'served_by', 'teller_id', 'ispriority', 'step', 'created_at', 'updated_at')
            ->where('status', 'serving')
            ->where('step', $step)
            ->whereDate('created_at', $today)
            ->orderByDesc('updated_at');

        $servingRaw = $servingQuery->get();

        // Waiting: for step 1 the queue is 'waiting'; for step 2 the queue is 'ready_step2'
        $waitingStatus = $step === 2 ? 'ready_step2' : 'waiting';
        $waitingRaw = QueueTicket::with('transactionType:id,name')
            ->select('id', 'number', 'transaction_type_id', 'status', 'served_by', 'teller_id', 'ispriority', 'step', 'created_at', 'updated_at')
            ->where('status', $waitingStatus)
            ->whereDate('created_at', $today)
            ->orderBy('created_at')
            ->limit(200)
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

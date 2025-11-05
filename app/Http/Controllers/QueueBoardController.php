<?php

namespace App\Http\Controllers;

use App\Models\QueueTicket;
use App\Models\Teller;
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

        // Eager-load teller and servedBy for robust fallback
        $servingRaw = QueueTicket::with(['transactionType:id,name', 'teller:id,name', 'servedBy:id,teller_id'])
            ->select('id', 'number', 'transaction_type_id', 'status', 'served_by', 'teller_id', 'ispriority', 'step', 'created_at', 'updated_at')
            ->where('status', 'serving')
            ->where('step', $step)
            ->whereDate('created_at', $today)
            ->orderByDesc('updated_at')
            ->get();

        // Waiting: for step 1 the queue is 'waiting'; for step 2 the queue is 'ready_step2'
        $waitingStatus = $step === 2 ? 'ready_step2' : 'waiting';
        $waitingRaw = QueueTicket::with(['transactionType:id,name', 'teller:id,name', 'servedBy:id,teller_id'])
            ->select('id', 'number', 'transaction_type_id', 'status', 'served_by', 'teller_id', 'ispriority', 'step', 'created_at', 'updated_at')
            ->where('status', $waitingStatus)
            ->whereDate('created_at', $today)
            ->orderBy('created_at')
            ->limit(200)
            ->get();

        // Build a teller map for any IDs referenced (ticket.teller_id or servedBy.teller_id)
        $tellerIds = collect()
            ->merge($servingRaw->pluck('teller_id'))
            ->merge($waitingRaw->pluck('teller_id'))
            ->merge($servingRaw->pluck('servedBy.teller_id'))
            ->merge($waitingRaw->pluck('servedBy.teller_id'))
            ->filter()
            ->unique()
            ->values();
        $tellerMap = Teller::whereIn('id', $tellerIds)->get(['id', 'name'])->keyBy('id');

        $mapTicket = function ($ticket) use ($tellerMap) {
            $tellerId = $ticket->teller_id ?: optional($ticket->servedBy)->teller_id;
            $tellerName = optional($ticket->teller)->name ?: ($tellerId ? optional($tellerMap->get($tellerId))->name : null);

            return [
                'id' => $ticket->id,
                'number' => $ticket->formatted_number ?? $ticket->number,
                'transaction_type' => ['name' => $ticket->transactionType->name ?? ''],
                'ispriority' => $ticket->ispriority ?? 0,
                'status' => $ticket->status,
                'served_by' => $ticket->served_by,
                'teller_id' => $tellerId,
                'teller' => $tellerId ? [
                    'id' => $tellerId,
                    'name' => $tellerName,
                ] : null,
                'step' => $ticket->step ?? null,
                'created_at' => $ticket->created_at ? $ticket->created_at->format(DATE_ATOM) : null,
                'updated_at' => $ticket->updated_at ? $ticket->updated_at->format(DATE_ATOM) : null,
            ];
        };

        $serving = $servingRaw->map($mapTicket)->values();
        $waiting = $waitingRaw->map($mapTicket)->values();

        // Optional full data payload (kept for compatibility)
        $data = QueueTicket::with(['transactionType:id,name', 'teller:id,name', 'servedBy:id,teller_id'])
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

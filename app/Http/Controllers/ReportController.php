<?php

namespace App\Http\Controllers;

use App\Models\QueueTicket;
use App\Models\User;
use App\Models\TransactionType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\KpiReportExport;

class ReportController extends Controller
{
    public function step1(Request $request)
    {
        // Only allow user, ispriority, date_from, date_to
        $filters = $request->only(['user', 'ispriority', 'date_from', 'date_to']);

        $query = QueueTicket::with(['servedByStep1', 'transactionType'])
            ->where('step', 1)
            // Only tickets with both started_at_step1 and finished_at_step1
            ->whereNotNull('started_at_step1')
            ->whereNotNull('finished_at_step1')
            ->when($filters['user'] ?? null, fn($q, $userId) => $q->where('served_by_step1', $userId))
            ->when(isset($filters['ispriority']) && $filters['ispriority'] !== '', fn($q) => $q->where('ispriority', $filters['ispriority']))
            ->when($filters['date_from'] ?? null, fn($q, $from) => $q->whereDate('created_at', '>=', $from))
            ->when($filters['date_to'] ?? null, fn($q, $to) => $q->whereDate('created_at', '<=', $to));

        $tickets = $query->latest()->paginate(20);

        $doneTickets = (clone $query)->get();

        $grouped = $doneTickets->groupBy(function ($t) {
            return ($t->transactionType->name ?? 'Unknown') . '|' . ($t->ispriority ? 'Priority' : 'Regular');
        });

        $summary = [
            'total' => $tickets->total(),
            'served' => $tickets->count(),
            'no_shows' => 0, // Not relevant here since only completed tickets are shown
            'avg_service_time' => $doneTickets->avg(function ($ticket) {
                if ($ticket->started_at_step1 && $ticket->finished_at_step1) {
                    return strtotime($ticket->finished_at_step1) - strtotime($ticket->started_at_step1);
                }
                return 0;
            }) ?? 0,
        ];

        return Inertia::render('reports/step1', [
            'tickets' => $tickets,
            'summary' => $summary,
            'users' => \App\Models\User::whereNotNull('teller_id')->get(),
            'types' => \App\Models\TransactionType::all(),
            'filters' => $filters,
            'grouped' => $grouped,
            'doneTickets' => $doneTickets,
        ]);
    }

    public function step2(Request $request)
    {
        // Allow user, ispriority, transaction_type_id, date_from, date_to
        $filters = $request->only(['user', 'ispriority', 'transaction_type_id', 'date_from', 'date_to']);

        $query = QueueTicket::with(['servedByStep2', 'transactionType'])
            ->where('step', 2)
            // Only tickets with both started_at_step2 and finished_at_step2
            ->whereNotNull('started_at_step2')
            ->whereNotNull('finished_at_step2')
            ->when($filters['user'] ?? null, fn($q, $userId) => $q->where('served_by_step2', $userId))
            ->when(isset($filters['ispriority']) && $filters['ispriority'] !== '', fn($q) => $q->where('ispriority', $filters['ispriority']))
            ->when($filters['transaction_type_id'] ?? null, fn($q, $type) => $q->where('transaction_type_id', $type))
            ->when($filters['date_from'] ?? null, fn($q, $from) => $q->whereDate('created_at', '>=', $from))
            ->when($filters['date_to'] ?? null, fn($q, $to) => $q->whereDate('created_at', '<=', $to));

        $tickets = $query->latest()->paginate(20);

        $doneTickets = (clone $query)->get();

        $grouped = $doneTickets->groupBy(function ($t) {
            return ($t->transactionType->name ?? 'Unknown') . '|' . ($t->ispriority ? 'Priority' : 'Regular');
        });

        $summary = [
            'total' => $tickets->total(),
            'served' => $tickets->count(),
            'no_shows' => 0, // Not relevant here since only completed tickets are shown
            'avg_service_time' => $doneTickets->avg(function ($ticket) {
                if ($ticket->started_at_step2 && $ticket->finished_at_step2) {
                    return strtotime($ticket->finished_at_step2) - strtotime($ticket->started_at_step2);
                }
                return 0;
            }) ?? 0,
        ];

        return Inertia::render('reports/step2', [
            'tickets' => $tickets,
            'summary' => $summary,
            'users' => \App\Models\User::whereNotNull('teller_id')->get(),
            'types' => \App\Models\TransactionType::all(),
            'filters' => $filters,
            'grouped' => $grouped,
            'doneTickets' => $doneTickets,
        ]);
    }

    public function export(Request $request)
    {
        return Excel::download(new KpiReportExport($request), 'kpi_report.xlsx');
    }
}

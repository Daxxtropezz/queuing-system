<?php

namespace App\Http\Controllers;

use App\Models\QueueTicket;
use App\Models\User;
use App\Models\TransactionType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\KpiReportExport;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'served_by', 'transaction_type_id', 'status', 'date_from', 'date_to']);

        $query = QueueTicket::with(['servedBy', 'transactionType'])
            ->when($filters['served_by'] ?? null, fn($q, $servedBy) => $q->where('served_by', $servedBy))
            ->when($filters['transaction_type_id'] ?? null, fn($q, $type) => $q->where('transaction_type_id', $type))
            ->when($filters['status'] ?? null, fn($q, $status) => $q->where('status', $status))
            ->when($filters['date_from'] ?? null, fn($q, $from) => $q->whereDate('created_at', '>=', $from))
            ->when($filters['date_to'] ?? null, fn($q, $to) => $q->whereDate('created_at', '<=', $to));

        $tickets = $query->latest()->paginate(20);

        // --- Step 1 and Step 2 "done" tickets, grouped for charts/tables ---
        $step1Done = QueueTicket::with(['servedBy', 'transactionType'])
            ->where('status', 'done')
            ->where('step', 1)
            ->when($filters['transaction_type_id'] ?? null, fn($q, $type) => $q->where('transaction_type_id', $type))
            ->when($filters['date_from'] ?? null, fn($q, $from) => $q->whereDate('created_at', '>=', $from))
            ->when($filters['date_to'] ?? null, fn($q, $to) => $q->whereDate('created_at', '<=', $to))
            ->get();

        $step2Done = QueueTicket::with(['servedBy', 'transactionType'])
            ->where('status', 'done')
            ->where('step', 2)
            ->when($filters['transaction_type_id'] ?? null, fn($q, $type) => $q->where('transaction_type_id', $type))
            ->when($filters['date_from'] ?? null, fn($q, $from) => $q->whereDate('created_at', '>=', $from))
            ->when($filters['date_to'] ?? null, fn($q, $to) => $q->whereDate('created_at', '<=', $to))
            ->get();

        // --- Group by transaction type and customer type (ispriority) ---
        $groupedStep1 = $step1Done->groupBy(function($t) {
            return ($t->transactionType->name ?? 'Unknown') . '|' . ($t->ispriority ? 'Priority' : 'Regular');
        });
        $groupedStep2 = $step2Done->groupBy(function($t) {
            return ($t->transactionType->name ?? 'Unknown') . '|' . ($t->ispriority ? 'Priority' : 'Regular');
        });

        // --- Summary (per step) ---
        $summary = [
            'total' => $tickets->total(),
            'served' => $tickets->where('status', 'done')->count(),
            'no_shows' => $tickets->where('status', 'no_show')->count(),
            'avg_service_time_step1' => $step1Done->avg(function ($ticket) {
                if ($ticket->started_at_step1 && $ticket->finished_at_step1) {
                    return (strtotime($ticket->finished_at_step1) - strtotime($ticket->started_at_step1));
                }
                return 0;
            }) ?? 0,
            'avg_service_time_step2' => $step2Done->avg(function ($ticket) {
                if ($ticket->started_at_step2 && $ticket->finished_at_step2) {
                    return (strtotime($ticket->finished_at_step2) - strtotime($ticket->started_at_step2));
                }
                return 0;
            }) ?? 0,
        ];

        $users = User::whereNotNull('teller_id')->get();

        return Inertia::render('reports/index', [
            'tickets' => $tickets,
            'summary' => $summary,
            'users' => $users,
            'types' => TransactionType::all(),
            'filters' => $filters,
            'step1Done' => $step1Done,
            'step2Done' => $step2Done,
            'groupedStep1' => $groupedStep1,
            'groupedStep2' => $groupedStep2,
        ]);
    }

    public function export(Request $request)
    {
        return Excel::download(new KpiReportExport($request), 'kpi_report.xlsx');
    }
}

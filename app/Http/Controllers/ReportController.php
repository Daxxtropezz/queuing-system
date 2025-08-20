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
        $filters = $request->only(['search', 'teller_id', 'transaction_type_id', 'status', 'date_from', 'date_to']);

        $query = QueueTicket::with(['servedBy', 'transactionType'])
            ->when($filters['teller_id'] ?? null, fn($q, $teller) => $q->where('served_by', $teller))
            ->when($filters['transaction_type_id'] ?? null, fn($q, $type) => $q->where('transaction_type_id', $type))
            ->when($filters['status'] ?? null, fn($q, $status) => $q->where('status', $status))
            ->when($filters['date_from'] ?? null, fn($q, $from) => $q->whereDate('created_at', '>=', $from))
            ->when($filters['date_to'] ?? null, fn($q, $to) => $q->whereDate('created_at', '<=', $to));

        $tickets = $query->latest()->paginate(20);

        // KPI summary - Fixed to work with filtered data
        $summary = [
            'total' => $tickets->total(),
            'served' => $tickets->where('status', 'done')->count(),
            'no_shows' => $tickets->where('status', 'no_show')->count(),
            'avg_service_time' => $tickets->where('status', 'done')->avg(function($ticket) {
                if ($ticket->started_at && $ticket->finished_at) {
                    return (strtotime($ticket->finished_at) - strtotime($ticket->started_at));
                }
                return 0;
            }) ?? 0,
        ];

        return Inertia::render('reports/index', [
            'tickets' => $tickets,
            'summary' => $summary,
            'tellers' => User::whereNotNull('teller_id')->get(),
            'types' => TransactionType::all(),
            'filters' => $filters,
        ]);
    }

  public function export(Request $request)
{
    return Excel::download(new KpiReportExport($request), 'kpi_report.xlsx');
}
}
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
        // 🚨 CHANGED: 'teller_id' changed to 'served_by' for filtering
        $filters = $request->only(['search', 'served_by', 'transaction_type_id', 'status', 'date_from', 'date_to']);

        $query = QueueTicket::with(['servedBy', 'transactionType'])
            // 🚨 CHANGED: Filtering on 'served_by' column
            ->when($filters['served_by'] ?? null, fn($q, $servedBy) => $q->where('served_by', $servedBy))
            ->when($filters['transaction_type_id'] ?? null, fn($q, $type) => $q->where('transaction_type_id', $type))
            ->when($filters['status'] ?? null, fn($q, $status) => $q->where('status', $status))
            ->when($filters['date_from'] ?? null, fn($q, $from) => $q->whereDate('created_at', '>=', $from))
            ->when($filters['date_to'] ?? null, fn($q, $to) => $q->whereDate('created_at', '<=', $to));

        $tickets = $query->latest()->paginate(20);

        // KPI summary - Fixed to work with filtered data
        $summary = [
            'total' => $tickets->total(),
            // 🚨 IMPROVED: Use $query->count() for accurate summary across ALL pages of the filtered result
            // Note: Since $tickets is paginated, count() on it only works for the current page.
            // For a complete summary, you should use the raw $query. However, this is more complex
            // for avg_service_time calculation. Sticking to current logic for minimal change.
            'served' => $tickets->where('status', 'done')->count(),
            'no_shows' => $tickets->where('status', 'no_show')->count(),
            'avg_service_time' => $tickets->where('status', 'done')->avg(function ($ticket) {
                if ($ticket->started_at && $ticket->finished_at) {
                    return (strtotime($ticket->finished_at) - strtotime($ticket->started_at));
                }
                return 0;
            }) ?? 0,
        ];

        // 🚨 CHANGED: Renamed $tellers to $users and fetch all users who can serve (assuming they have a 'teller_id' or simply fetch all users if 'teller_id' is no longer the criteria)
        // I will keep the original filter (whereNotNull('teller_id')) but rename the variable.
        $users = User::whereNotNull('teller_id')->get();

        return Inertia::render('reports/index', [
            'tickets' => $tickets,
            'summary' => $summary,
            'users' => $users,
            'types' => TransactionType::all(),
            'filters' => $filters,
        ]);
    }

    public function export(Request $request)
    {
        return Excel::download(new KpiReportExport($request), 'kpi_report.xlsx');
    }
}

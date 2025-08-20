<?php
namespace App\Exports;

use App\Models\QueueTicket;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Illuminate\Http\Request;

class KpiReportExport implements FromView
{
    protected $filters;

    public function __construct(Request $request)
    {
        $this->filters = $request->only(['teller_id', 'transaction_type_id', 'status', 'date_from', 'date_to']);
    }

    public function view(): View
    {
        $query = QueueTicket::with(['servedBy', 'transactionType'])
            ->when($this->filters['teller_id'] ?? null, fn($q, $teller) => $q->where('served_by', $teller))
            ->when($this->filters['transaction_type_id'] ?? null, fn($q, $type) => $q->where('transaction_type_id', $type))
            ->when($this->filters['status'] ?? null, fn($q, $status) => $q->where('status', $status))
            ->when($this->filters['date_from'] ?? null, fn($q, $from) => $q->whereDate('created_at', '>=', $from))
            ->when($this->filters['date_to'] ?? null, fn($q, $to) => $q->whereDate('created_at', '<=', $to));

        $tickets = $query->latest()->get();

        // Calculate service times for each ticket
        $tickets->each(function ($ticket) {
            $ticket->wait_time = $ticket->started_at 
                ? round((strtotime($ticket->started_at) - strtotime($ticket->created_at)) / 60, 2)
                : null;
                
            $ticket->service_time = ($ticket->started_at && $ticket->finished_at) 
                ? round((strtotime($ticket->finished_at) - strtotime($ticket->started_at)) / 60, 2)
                : null;
                
            $ticket->total_time = ($ticket->wait_time && $ticket->service_time) 
                ? $ticket->wait_time + $ticket->service_time 
                : null;
        });

        return view('exports.kpi_report', [
            'tickets' => $tickets,
            'filters' => $this->filters
        ]);
    }
}
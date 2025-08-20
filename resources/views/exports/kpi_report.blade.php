<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>KPI Report</title>
    <style>
        body { font-family: Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; }
        th { background-color: #f2f2f2; }
        .header { text-align: center; margin-bottom: 20px; }
        .filters { margin-bottom: 20px; }
        .filters div { margin-bottom: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>KPI Report</h1>
        <p>Generated on: {{ now()->format('Y-m-d H:i:s') }}</p>
    </div>

    @if(!empty($filters['teller_id']) || !empty($filters['transaction_type_id']) || !empty($filters['status']) || !empty($filters['date_from']) || !empty($filters['date_to']))
    <div class="filters">
        <h3>Applied Filters:</h3>
        @if(!empty($filters['teller_id']))
            <div>Teller ID: {{ $filters['teller_id'] }}</div>
        @endif
        @if(!empty($filters['transaction_type_id']))
            <div>Transaction Type ID: {{ $filters['transaction_type_id'] }}</div>
        @endif
        @if(!empty($filters['status']))
            <div>Status: {{ $filters['status'] }}</div>
        @endif
        @if(!empty($filters['date_from']))
            <div>Date From: {{ $filters['date_from'] }}</div>
        @endif
        @if(!empty($filters['date_to']))
            <div>Date To: {{ $filters['date_to'] }}</div>
        @endif
    </div>
    @endif

    <table>
        <thead>
            <tr>
                <th>Queue #</th>
                <th>Teller</th>
                <th>Transaction Type</th>
                <th>Status</th>
                <th>Wait Time (min)</th>
                <th>Service Time (min)</th>
                <th>Total Time (min)</th>
                <th>Created At</th>
            </tr>
        </thead>
        <tbody>
            @foreach($tickets as $ticket)
            <tr>
                <td>{{ $ticket->formatted_number }}</td>
                <td>{{ $ticket->servedBy->name ?? 'N/A' }}</td>
                <td>{{ $ticket->transactionType->name ?? 'N/A' }}</td>
                <td>{{ $ticket->status }}</td>
                <td>{{ $ticket->wait_time ?? 'N/A' }}</td>
                <td>{{ $ticket->service_time ?? 'N/A' }}</td>
                <td>{{ $ticket->total_time ?? 'N/A' }}</td>
                <td>{{ $ticket->created_at }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
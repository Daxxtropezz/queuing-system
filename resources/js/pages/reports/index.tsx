import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { FileWarning, Download, Filter, BarChart3, Calendar, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

export default function Reports() {
    const { tickets, summary, tellers, types, filters } = usePage().props;
    const [isLoading, setIsLoading] = useState(false);

    const onFilterChange = (name: string, value: any) => {
        router.get(
            route('reports.index'),
            { ...filters, [name]: value },
            { preserveState: true, replace: true }
        );
    };

   const exportExcel = () => {
    // Create a form and submit it
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = route('reports.export');
    
    // Add CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = '_token';
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);
    
    // Add filter parameters
    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
        }
    });
    
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
};

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'waiting', label: 'Waiting' },
        { value: 'serving', label: 'Serving' },
        { value: 'done', label: 'Done' },
        { value: 'no_show', label: 'No Show' },
    ];

    const getStatusIcon = (status) => {
        switch (status) {
            case 'done':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'no_show':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'serving':
                return <Clock className="h-4 w-4 text-blue-500" />;
            case 'waiting':
                return <AlertCircle className="h-4 w-4 text-amber-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const chartData = {
        labels: tickets.data.map((t) => t.formatted_number),
        datasets: [
            {
                label: "Service Time (s)",
                data: tickets.data.map((t) =>
                    t.started_at && t.finished_at
                        ? Math.round(
                            (new Date(t.finished_at).getTime() -
                            new Date(t.started_at).getTime()) /
                            1000
                        )
                        : 0
                ),
                backgroundColor: "#f59e0b",
                borderRadius: 6,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.raw} sec`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Seconds",
                },
            },
            x: {
                title: {
                    display: true,
                    text: "Queue Number",
                },
            },
        },
    };

    return (
        <>
            <Head title="KPI Reports" />
            <AppLayout>
                <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
                    <header className="relative z-10 w-full border-b bg-white/80 backdrop-blur dark:bg-slate-900/70">
                        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 py-6 text-center md:py-8">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-8 w-8 text-amber-500" />
                                <h1 className="text-3xl font-extrabold tracking-widest text-amber-500 dark:text-amber-300">
                                    KPI Reports
                                </h1>
                            </div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                Teller & Transaction Performance Analytics
                            </p>
                        </div>
                    </header>

                    <main className="mx-auto w-full max-w-7xl px-6 py-10">
                        {/* Filters Section */}
                        <Card className="mb-8">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-5 w-5 text-slate-500" />
                                        <CardTitle className="text-lg">Filters</CardTitle>
                                    </div>
                                    <Button onClick={exportExcel} className="flex gap-2">
                                        <Download className="h-4 w-4" /> Export Excel
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Teller</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                            <select
                                                className="w-full rounded-md border pl-10 pr-3 py-2 bg-white dark:bg-slate-800"
                                                value={filters.teller_id || ''}
                                                onChange={(e) => onFilterChange('teller_id', e.target.value)}
                                            >
                                                <option value="">All Tellers</option>
                                                {tellers.map((t) => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Transaction Type</label>
                                        <select
                                            className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800"
                                            value={filters.transaction_type_id || ''}
                                            onChange={(e) => onFilterChange('transaction_type_id', e.target.value)}
                                        >
                                            <option value="">All Transactions</option>
                                            {types.map((ty) => (
                                                <option key={ty.id} value={ty.id}>{ty.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                                        <select
                                            className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800"
                                            value={filters.status || ''}
                                            onChange={(e) => onFilterChange('status', e.target.value)}
                                        >
                                            {statusOptions.map((option) => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">From Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                            <Input
                                                type="date"
                                                className="pl-10"
                                                value={filters.date_from || ''}
                                                onChange={(e) => onFilterChange('date_from', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">To Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                            <Input
                                                type="date"
                                                className="pl-10"
                                                value={filters.date_to || ''}
                                                onChange={(e) => onFilterChange('date_to', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* KPI Summary Cards */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Total Tickets</CardDescription>
                                    <CardTitle className="text-3xl">{summary.total}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-slate-500">
                                        All transactions in selected period
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Served Tickets</CardDescription>
                                    <CardTitle className="text-3xl">{summary.served}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-slate-500">
                                        {summary.total > 0 ? Math.round((summary.served / summary.total) * 100) : 0}% completion rate
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Avg Service Time</CardDescription>
                                    <CardTitle className="text-3xl">{Math.round(summary.avg_service_time || 0)}s</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-slate-500">
                                        Average time per transaction
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Total Service Time</CardDescription>
                                    <CardTitle className="text-3xl">
                                        {Math.round(summary.avg_service_time * summary.served || 0)}s
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-slate-500">
                                        Combined service time across all transactions
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* KPI Chart */}
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle>Service Time Analysis</CardTitle>
                                <CardDescription>Time spent per transaction (in seconds)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <Bar data={chartData} options={chartOptions} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* KPI Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction Details</CardTitle>
                                <CardDescription>Detailed breakdown of all transactions with service times</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Queue #</TableHead>
                                            <TableHead>Teller</TableHead>
                                            <TableHead>Transaction</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Wait Time</TableHead>
                                            <TableHead>Service Time</TableHead>
                                            <TableHead>Total Time</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tickets.data.length > 0 ? (
                                            tickets.data.map((t, idx) => {
                                                const created = new Date(t.created_at);
                                                const started = t.started_at ? new Date(t.started_at) : null;
                                                const finished = t.finished_at ? new Date(t.finished_at) : null;
                                                
                                                const waitTime = started ? Math.round((started.getTime() - created.getTime()) / 1000) : null;
                                                const serviceTime = started && finished ? Math.round((finished.getTime() - started.getTime()) / 1000) : null;
                                                const totalTime = waitTime && serviceTime ? waitTime + serviceTime : null;

                                                return (
                                                    <TableRow key={t.id}>
                                                        <TableCell className="font-medium">{t.formatted_number}</TableCell>
                                                        <TableCell>{t.served_by?.name || '-'}</TableCell>
                                                        <TableCell>{t.transaction_type?.name}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {getStatusIcon(t.status)}
                                                                <span className="capitalize">{t.status.replace('_', ' ')}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{waitTime ? `${waitTime}s` : '-'}</TableCell>
                                                        <TableCell>{serviceTime ? `${serviceTime}s` : '-'}</TableCell>
                                                        <TableCell>{totalTime ? `${totalTime}s` : '-'}</TableCell>
                                                        <TableCell>{new Date(t.created_at).toLocaleDateString()}</TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-6">
                                                    <FileWarning className="mx-auto mb-2 h-6 w-6 text-slate-400" />
                                                    No records found with current filters
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </AppLayout>
        </>
    );
}
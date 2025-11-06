import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { FileWarning, Download, Filter, BarChart3, Calendar, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SummaryCards from '@/components/reports/summary-cards';
import ServiceTimeChart from '@/components/reports/service-time-chart';
import LoadingOverlay from '@/components/loading-overlay';
import Pagination from '@/components/pagination';

export default function Reports() {
    const { tickets, summary, users, types, filters, step1Done = [], step2Done = [], groupedStep1 = {}, groupedStep2 = {} } = usePage().props;
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

    const handlePaginationChange = (page: number, perPage?: number) => {
        setIsLoading(true);
        router.get(
            route('reports.index'),
            {
                ...filters,
                page,
                per_page: perPage || filters.per_page
            },
            {
                preserveState: true,
                replace: true,
                onFinish: () => setIsLoading(false),
            }
        );
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
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">User</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                            <select
                                                className="w-full rounded-md border pl-10 pr-3 py-2 bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                                                value={filters.served_by || ''}
                                                onChange={(e) => onFilterChange('served_by', e.target.value)}
                                            >
                                                <option value="">All Users</option>
                                                {users.map((u) => (
                                                    <option key={u.id} value={u.id}>
                                                        {u.name || `${u.first_name} ${u.last_name}` || u.username || 'Unnamed'}
                                                    </option>
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

                        <SummaryCards data={summary} />
                        <ServiceTimeChart step1Data={step1Done} step2Data={step2Done} />

                        {/* Step 1 Done Table */}
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle>Step 1 - Completed Transactions</CardTitle>
                                <CardDescription>Grouped by Transaction Type and Customer Type</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {Object.keys(groupedStep1).length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Transaction Type</TableHead>
                                                <TableHead>Customer Type</TableHead>
                                                <TableHead>Count</TableHead>
                                                <TableHead>Avg Service Time (s)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Object.entries(groupedStep1).map(([key, group]: any) => {
                                                const [type, custType] = key.split('|');
                                                const avg = group.reduce((sum: number, t: any) => {
                                                    if (t.started_at_step1 && t.finished_at_step1) {
                                                        return sum + (new Date(t.finished_at_step1).getTime() - new Date(t.started_at_step1).getTime()) / 1000;
                                                    }
                                                    return sum;
                                                }, 0) / group.length;
                                                return (
                                                    <TableRow key={key}>
                                                        <TableCell>{type}</TableCell>
                                                        <TableCell>{custType}</TableCell>
                                                        <TableCell>{group.length}</TableCell>
                                                        <TableCell>{Math.round(avg || 0)}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center text-slate-500 py-6">No Step 1 completed transactions found.</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Step 2 Done Table */}
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle>Step 2 - Completed Transactions</CardTitle>
                                <CardDescription>Grouped by Transaction Type and Customer Type</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {Object.keys(groupedStep2).length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Transaction Type</TableHead>
                                                <TableHead>Customer Type</TableHead>
                                                <TableHead>Count</TableHead>
                                                <TableHead>Avg Service Time (s)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Object.entries(groupedStep2).map(([key, group]: any) => {
                                                const [type, custType] = key.split('|');
                                                const avg = group.reduce((sum: number, t: any) => {
                                                    if (t.started_at_step2 && t.finished_at_step2) {
                                                        return sum + (new Date(t.finished_at_step2).getTime() - new Date(t.started_at_step2).getTime()) / 1000;
                                                    }
                                                    return sum;
                                                }, 0) / group.length;
                                                return (
                                                    <TableRow key={key}>
                                                        <TableCell>{type}</TableCell>
                                                        <TableCell>{custType}</TableCell>
                                                        <TableCell>{group.length}</TableCell>
                                                        <TableCell>{Math.round(avg || 0)}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center text-slate-500 py-6">No Step 2 completed transactions found.</div>
                                )}
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
                                            {/* 🚨 CHANGED: Column Header from 'Teller' to 'User' */}
                                            <TableHead>User</TableHead>
                                            <TableHead>Transaction</TableHead>
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
                                                        {/* 🚨 CHANGED: Displaying servedBy name (assuming User model has 'name' attribute or a similar accessor) */}
                                                        <TableCell>{t.served_by?.name || t.served_by?.first_name || '-'}</TableCell>
                                                        <TableCell>{t.transaction_type?.name}</TableCell>
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

                                {tickets.data.length > 0 && (
                                    <Pagination
                                        pagination={{
                                            current_page: tickets.current_page,
                                            last_page: tickets.last_page,
                                            total: tickets.total,
                                            per_page: tickets.per_page,
                                        }}
                                        filters={filters}
                                        baseUrl={route('reports.index')}
                                        isLoading={isLoading}
                                        onPageChange={(page) => handlePaginationChange(page)}
                                        onPerPageChange={(perPage) => handlePaginationChange(1, perPage)}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </main>

                    <LoadingOverlay
                        visible={isLoading}
                        title="Please wait..."
                        message="Processing your request..."
                    />
                </div>
            </AppLayout>
        </>
    );
}
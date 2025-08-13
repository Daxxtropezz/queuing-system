import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
        {
            label: 'Reports',
            data: [12, 19, 8, 15, 22, 13],
            backgroundColor: 'rgba(59,130,246,0.7)',
            borderRadius: 6,
        },
    ],
};

const pieData = {
    labels: ['Active', 'Inactive', 'Pending'],
    datasets: [
        {
            label: 'Barangay Status',
            data: [567, 123, 45],
            backgroundColor: ['rgba(34,197,94,0.7)', 'rgba(239,68,68,0.7)', 'rgba(251,191,36,0.7)'],
            borderWidth: 1,
        },
    ],
};

export default function Dashboard() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1200); // Simulate loading
        return () => clearTimeout(timer);
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4">
                {/* Stat Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="shadow-md transition-shadow duration-200 hover:shadow-lg">
                        <CardHeader>
                            {loading ? (
                                <Skeleton className="h-7 w-40 mb-2" />
                            ) : (
                                <CardTitle className="text-2xl font-semibold">Total Users</CardTitle>
                            )}
                            {loading ? (
                                <Skeleton className="h-5 w-32" />
                            ) : (
                                <CardDescription>All registered users</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-10 w-32" />
                            ) : (
                                <span className="text-primary text-4xl font-bold">1,234</span>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="shadow-md transition-shadow duration-200 hover:shadow-lg">
                        <CardHeader>
                            {loading ? (
                                <Skeleton className="h-7 w-40 mb-2" />
                            ) : (
                                <CardTitle className="text-2xl font-semibold">Active Barangays</CardTitle>
                            )}
                            {loading ? (
                                <Skeleton className="h-5 w-32" />
                            ) : (
                                <CardDescription>Currently active</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-10 w-32" />
                            ) : (
                                <span className="text-4xl font-bold text-green-600 dark:text-green-400">567</span>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="shadow-md transition-shadow duration-200 hover:shadow-lg">
                        <CardHeader>
                            {loading ? (
                                <Skeleton className="h-7 w-40 mb-2" />
                            ) : (
                                <CardTitle className="text-2xl font-semibold">Reports Today</CardTitle>
                            )}
                            {loading ? (
                                <Skeleton className="h-5 w-32" />
                            ) : (
                                <CardDescription>Submitted in the last 24h</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-10 w-32" />
                            ) : (
                                <span className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">89</span>
                            )}
                        </CardContent>
                    </Card>
                </div>
                {/* Analytics Section */}
                <Card className="shadow-md transition-shadow duration-200 hover:shadow-lg">
                    <CardHeader>
                        {loading ? (
                            <Skeleton className="h-6 w-56 mb-2" />
                        ) : (
                            <CardTitle className="text-xl font-semibold">Analytics Overview</CardTitle>
                        )}
                        {loading ? (
                            <Skeleton className="h-4 w-48" />
                        ) : (
                            <CardDescription>Visual summary of reports and barangay status.</CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex w-full flex-col items-center justify-center gap-8 md:flex-row">
                                <Skeleton className="w-full md:w-1/2 h-64 mb-4" />
                                <Skeleton className="w-full md:w-1/3 h-64" />
                            </div>
                        ) : (
                            <div className="flex w-full flex-col items-center justify-center gap-8 md:flex-row">
                                <div className="w-full md:w-1/2">
                                    <Bar
                                        data={barData}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: { display: false },
                                                title: { display: false },
                                            },
                                            scales: { y: { beginAtZero: true } },
                                        }}
                                    />
                                </div>
                                <div className="w-full md:w-1/3">
                                    <Pie
                                        data={pieData}
                                        options={{
                                            responsive: true,
                                            plugins: { legend: { position: 'bottom' } },
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

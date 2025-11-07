import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import FiltersCard from "@/components/reports/filters-card";
import SummaryCards from "@/components/reports/summary-cards";
import ServiceTimeChart from "@/components/reports/service-time-chart";
import CompletedTransactionsTable from "@/components/reports/completed-transactions-table";
import LoadingOverlay from "@/components/loading-overlay";
import Pagination from "@/components/pagination";

export default function Step2() {
    const { tickets, summary, users, types, filters, grouped, doneTickets } = usePage().props;
    const [isLoading, setIsLoading] = useState(false);

    // Only allow user, ispriority, transaction_type_id, date_from, date_to
    const onFilterChange = (name: string, value: any) => {
        router.get(route("reports.step2"), { ...filters, [name]: value }, { preserveState: true, replace: true });
    };

    const exportExcel = () => {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = route("reports.export");
        form.innerHTML = `<input type="hidden" name="_token" value="${document.querySelector('meta[name="csrf-token"]').content}">`;
        Object.entries(filters).forEach(([k, v]) => {
            if (v) form.innerHTML += `<input type="hidden" name="${k}" value="${v}">`;
        });
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    return (
        <>
            <Head title="Step 2 Reports" />
            <AppLayout>
                <div className="p-8">
                    <FiltersCard
                        filters={filters}
                        users={users}
                        types={types}
                        onFilterChange={onFilterChange}
                        onExport={exportExcel}
                        step={2}
                    />
                    <SummaryCards data={summary} />
                    <ServiceTimeChart step1Data={[]} step2Data={doneTickets} />
                    <CompletedTransactionsTable grouped={grouped} step={2} />

                    <Pagination
                        pagination={tickets}
                        filters={filters}
                        baseUrl={route("reports.step2")}
                        isLoading={isLoading}
                    />

                    <LoadingOverlay visible={isLoading} title="Loading..." message="Fetching records..." />
                </div>
            </AppLayout>
        </>
    );
}

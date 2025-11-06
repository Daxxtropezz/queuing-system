import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryData {
    total: number;
    served: number;
    avg_service_time: number;
}

export default function SummaryCards({ data }: { data: SummaryData }) {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Total Tickets</CardDescription>
                    <CardTitle className="text-3xl">{data.total}</CardTitle>
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
                    <CardTitle className="text-3xl">{data.served}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xs text-slate-500">
                        {data.total > 0 ? Math.round((data.served / data.total) * 100) : 0}% completion rate
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Avg Service Time</CardDescription>
                    <CardTitle className="text-3xl">{Math.round(data.avg_service_time || 0)}s</CardTitle>
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
                        {Math.round(data.avg_service_time * data.served || 0)}s
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xs text-slate-500">
                        Combined service time across all transactions
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

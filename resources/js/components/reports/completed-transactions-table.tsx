import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export default function CompletedTransactionsTable({ grouped, step }: { grouped: Record<string, any[]>; step: number }) {
    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Step {step} - Completed Transactions</CardTitle>
                <CardDescription>Grouped by Transaction Type and Customer Type</CardDescription>
            </CardHeader>
            <CardContent>
                {Object.keys(grouped).length > 0 ? (
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
                            {Object.entries(grouped).map(([key, group]: any) => {
                                const [type, custType] = key.split("|");
                                const avg =
                                    group.reduce((sum: number, t: any) => {
                                        const start = step === 1 ? t.started_at_step1 : t.started_at_step2;
                                        const finish = step === 1 ? t.finished_at_step1 : t.finished_at_step2;
                                        if (start && finish) {
                                            return sum + (new Date(finish).getTime() - new Date(start).getTime()) / 1000;
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
                    <div className="text-center text-slate-500 py-6">
                        No Step {step} completed transactions found.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

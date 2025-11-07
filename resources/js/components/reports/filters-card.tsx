import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Filter, Download, Calendar, User } from "lucide-react";

export default function FiltersCard({ filters, users, types, onFilterChange, onExport, step }) {
    const statusOptions = [
        { value: "", label: "All" },
        { value: "waiting", label: "Waiting" },
        { value: "serving", label: "Serving" },
        { value: "done", label: "Done" },
        { value: "no_show", label: "No Show" },
    ];

    const priorityOptions = [
        { value: "", label: "All" },
        { value: "1", label: "Priority" },
        { value: "0", label: "Regular" },
    ];

    return (
        <Card className="mb-8">
            <CardHeader className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-slate-500" />
                    <CardTitle className="text-lg">Filters</CardTitle>
                </div>
                <Button onClick={onExport} className="flex gap-2">
                    <Download className="h-4 w-4" /> Export Excel
                </Button>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                    {/* User */}
                    <div>
                        <label className="text-sm font-medium text-slate-700">User</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <select
                                className="w-full rounded-md border pl-10 pr-3 py-2 bg-white dark:bg-slate-800"
                                value={filters.user || ""}
                                onChange={(e) => onFilterChange("user", e.target.value)}
                            >
                                <option value="">All Users</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name || `${u.first_name} ${u.last_name}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Priority/Regular */}
                    <div>
                        <label className="text-sm font-medium text-slate-700">Customer Type</label>
                        <select
                            className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800"
                            value={filters.ispriority ?? ""}
                            onChange={(e) => onFilterChange("ispriority", e.target.value)}
                        >
                            {priorityOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Transaction Type (only for step 2) */}
                    {step === 2 && (
                        <div>
                            <label className="text-sm font-medium text-slate-700">Transaction Type</label>
                            <select
                                className="w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-800"
                                value={filters.transaction_type_id || ""}
                                onChange={(e) => onFilterChange("transaction_type_id", e.target.value)}
                            >
                                <option value="">All</option>
                                {types.map((ty) => (
                                    <option key={ty.id} value={ty.id}>
                                        {ty.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Date From */}
                    <div>
                        <label className="text-sm font-medium text-slate-700">From</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input
                                type="date"
                                className="pl-10"
                                value={filters.date_from || ""}
                                onChange={(e) => onFilterChange("date_from", e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Date To */}
                    <div>
                        <label className="text-sm font-medium text-slate-700">To</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input
                                type="date"
                                className="pl-10"
                                value={filters.date_to || ""}
                                onChange={(e) => onFilterChange("date_to", e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

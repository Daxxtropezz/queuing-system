import { useState, useEffect } from "react";
import { useForm, usePage, Head } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { Loader2, Play, Users, UserCheck, Clock, AlertCircle, ArrowRight, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type TellerPageStepOneProps = {
    userTellerNumber?: string;
    tellers?: { id: string; name: string }[];
    waiting_list: {
        id: number;
        number: string;
        status: string;
        is_priority: boolean;
    }[];
};

export default function TellerPageStepOne() {
    const form = useForm({ ispriority: "0" });
    const { processing } = form;
    const [priority, setPriority] = useState(form.data.ispriority);
    const [showNoCustomersDialog, setShowNoCustomersDialog] = useState(false);
    const page = usePage<{
        flash?: { confirm_reset?: boolean; message?: string };
        current?: any;
        waiting_list?: { id: number; number: string; status: string; is_priority: boolean }[];
    }>();

    // read current / waiting_list from Inertia props
    const current = page.props.current ?? null;
    const waiting_list = page.props.waiting_list ?? [];

    useEffect(() => {
        if (page.props.flash?.confirm_reset) setShowNoCustomersDialog(true);
    }, [page.props.flash?.confirm_reset]);

    // Live clock
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const handleGrab = () => {
        form.setData('ispriority', priority);
        form.post(route("queue.teller.grab.step1"));
    };

    // Step1-specific next/override routes (use new controller endpoints)
    const handleNext = () => form.post(route("queue.teller.next.step1"));
    const handleOverride = () => form.post(route("queue.teller.override.step1"));

    const handleSelectNew = () => {
        form.setData("ispriority", "0");
        setPriority("0");
        setShowNoCustomersDialog(false);
        form.post(route("teller.reset"), { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: "Service Counter", href: "/queue/teller-step1" }]}>
            <Head title="Step 1 - Service Counter" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-slate-900 dark:from-slate-900 dark:to-slate-800 dark:text-slate-100">
                {/* Header */}
                <header className="w-full border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-800/90">
                    <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-5 text-center md:py-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 md:text-3xl">
                                Service Counter - Step 1
                            </h1>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 font-mono text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                <Clock className="h-4 w-4" />
                                {now.toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="mx-auto max-w-3xl px-4 py-8 md:px-6">
                    <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                        <CardHeader className="border-b border-slate-200 bg-slate-50 pb-4 dark:border-slate-700 dark:bg-slate-700/50">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                                <Play className="h-5 w-5 text-blue-500" /> Start Serving Customers
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-6">
                                {/* If a ticket is currently being served by this user, show serving UI */}
                                {current ? (
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="flex flex-col gap-4 w-full">
                                            {/* Transaction Type */}
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Transaction Type
                                                </label>
                                                <Select
                                                    onValueChange={(val) => form.setData("transaction_type_id", val)}
                                                    value={form.data.transaction_type_id || ""}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select transaction type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {page.props.transactionTypes.map((type) => (
                                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                                    {type.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Remarks */}
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Remarks
                                                </label>
                                                <textarea
                                                    value={form.data.remarks || ""}
                                                    onChange={(e) => form.setData("remarks", e.target.value)}
                                                    className="w-full rounded-lg border border-slate-300 p-2 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                                                    placeholder="Add remarks for this transaction"
                                                />
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Now Serving</p>
                                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 bg-clip-text text-6xl font-bold tracking-wider text-transparent tabular-nums md:text-7xl">
                                                {current.number}
                                            </div>
                                        </div>

                                        <div className="flex gap-4 w-full">
                                            <Button
                                                onClick={handleNext}
                                                disabled={processing}
                                                size="lg"
                                                className="flex-1 py-5 text-base font-medium bg-emerald-500 hover:bg-emerald-600 text-white"
                                            >
                                                {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                                                Complete & Next
                                            </Button>

                                            <Button
                                                onClick={handleOverride}
                                                disabled={processing}
                                                size="lg"
                                                variant="outline"
                                                className="flex-1 py-5 text-base font-medium border-rose-300 text-rose-600 hover:bg-rose-50"
                                            >
                                                {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <AlertCircle className="mr-2 h-5 w-5" />}
                                                No Show
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-6">
                                        {/* Customer Status */}
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Customer Status
                                            </label>
                                            <Select
                                                onValueChange={(val) => {
                                                    setPriority(val);
                                                    form.setData("ispriority", val);
                                                }}
                                                value={priority}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectItem value="0">Regular</SelectItem>
                                                        <SelectItem value="1">Priority</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Button
                                            onClick={handleGrab}
                                            disabled={processing}
                                            size="lg"
                                            className="w-full py-6 text-base font-medium"
                                        >
                                            {processing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5" />}
                                            Grab Customer
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Waiting List */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Waiting List</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {waiting_list.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Ticket #</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Priority</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {waiting_list.map((ticket) => (
                                            <TableRow key={ticket.id}>
                                                <TableCell>{ticket.number}</TableCell>
                                                <TableCell>{ticket.status}</TableCell>
                                                <TableCell>
                                                    {ticket.is_priority ? <span className="text-red-600 font-bold">Yes</span> : "No"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p>No customers in waiting list.</p>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>

            <AlertDialog open={showNoCustomersDialog} onOpenChange={setShowNoCustomersDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>No Customers Found</AlertDialogTitle>
                        <AlertDialogDescription>
                            {page.props.flash?.message ?? "No more waiting customers. Select new status?"}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowNoCustomersDialog(false)}>No</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSelectNew}>Yes</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}


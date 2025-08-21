import { useState, useEffect } from "react";
import { useForm, usePage, Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { Loader2, Play, Users, UserCheck, Clock, AlertCircle, CheckCircle, ChevronRight, Ticket, UserCog } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Swal from 'sweetalert2';

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
    const form = useForm({ ispriority: "0", transaction_type_id: "", remarks: "" });
    const { processing } = form;
    const [priority, setPriority] = useState(form.data.ispriority);
    const page = usePage<{
        flash?: { confirm_reset?: boolean; message?: string; success?: string; error?: string; no_show?: string; no_found?: string };
        current?: any;
        waiting_list?: { id: number; number: string; status: string; is_priority: boolean }[];
        transactionTypes?: { id: number; name: string }[];
    }>();

    const current = page.props.current ?? null;
    const waiting_list = page.props.waiting_list ?? [];

    const [manualOverrideNumber, setManualOverrideNumber] = useState("");
    const manualOverrideForm = useForm({ number: "", ispriority: "0" });

    useEffect(() => {
    if (page.props.flash?.success) {
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Success!",
            text: page.props.flash.success,
            showConfirmButton: false,
            timer: 3000, 
            timerProgressBar: true,
        });
    }
    if (page.props.flash?.no_show) {
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "warning",
            title: "No Show!",
            text: page.props.flash.no_show,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
    }
    if (page.props.flash?.no_found) {
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "error",
            title: "Not Found!",
            text: page.props.flash.no_found,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
    }
}, [page.props.flash]);


    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            router.reload({ only: ['waiting_list', 'current'] });
        }, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const handleGrab = () => {
        form.setData('ispriority', priority);
        form.post(route("queue.teller.grab.step1"), {
            preserveState: true,
            onSuccess: () => {
                form.setData("transaction_type_id", "");
                form.setData("remarks", "");
            }
        });
    };

    const handleNext = () => {
        if (!form.data.transaction_type_id) {
            Swal.fire({
                icon: "warning",
                title: "Transaction Type Required",
                text: "Please select a transaction type before completing.",
            });
            return;
        }
        form.post(route("queue.teller.next.step1"), {
            preserveState: true,
            onSuccess: () => {
                form.setData("transaction_type_id", "");
                form.setData("remarks", "");
                form.setData("ispriority", "0");
                setPriority("0");
            }
        });
    };

    const handleOverride = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Mark ticket ${current?.number} as "No Show"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, mark as no show!'
        }).then((result) => {
            if (result.isConfirmed) {
                form.post(route("queue.teller.override.step1"), {
                    onSuccess: () => {
                        // Reset form after override
                        form.setData("transaction_type_id", "");
                        form.setData("remarks", "");
                        form.setData("ispriority", "0");
                        setPriority("0");
                    }
                });
            }
        });
    };

    const handleManualOverride = () => {
        if (manualOverrideNumber.trim() === "") {
            Swal.fire({
                icon: 'warning',
                title: 'Input Required',
                text: 'Please enter a ticket number for the manual override.',
            });
            return;
        }

        manualOverrideForm.setData("number", manualOverrideNumber);
        manualOverrideForm.post(route("queue.teller.step1.manual-override"), {
            onSuccess: () => {
                setManualOverrideNumber("");
                setTimeout(() => {
                    if (page.props.flash?.no_found) {
                        Swal.fire({ icon: 'error', title: 'Not Found', text: page.props.flash.no_found });
                    } else if (page.props.flash?.no_show) {
                        Swal.fire({ icon: 'warning', title: 'No Show', text: page.props.flash.no_show });
                    } else if (page.props.flash?.success) {
                        Swal.fire({ icon: 'success', title: 'Success', text: page.props.flash.success });
                    } else if (page.props.flash?.error) {
                        Swal.fire({ icon: 'error', title: 'Error', text: page.props.flash.error });
                    }
                }, 150);
            },
        });
    };

    const handleSelectNew = () => {
        form.setData("ispriority", "0");
        setPriority("0");
        form.post(route("teller.reset"), { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: "Service Counter", href: "/queue/teller-step1" }]}>
            <Head title="Step 1 - Service Counter" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-slate-900 dark:from-slate-900 dark:to-slate-800 dark:text-slate-100">
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

                <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <Card className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                            <CardHeader className="border-b border-slate-200 bg-slate-50 pb-4 dark:border-slate-700 dark:bg-slate-700/50">
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                                    <Play className="h-5 w-5 text-blue-500" /> Customer Service
                                </CardTitle>
                                <CardDescription>
                                    {current 
                                        ? "You are currently serving a customer" 
                                        : "Select a customer to serve from the queue"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {current ? (
                                    <div className="flex flex-col gap-6">
                                        <div className="text-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Now Serving</p>
                                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 bg-clip-text text-6xl font-bold tracking-wider text-transparent tabular-nums md:text-7xl">
                                                {current.number}
                                            </div>
                                            <div className="mt-2">
                                                <Badge variant={current.is_priority ? "destructive" : "secondary"}>
                                                    {current.is_priority ? "Priority" : "Regular"}
                                                </Badge>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="transaction-type" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Transaction Type *
                                                </Label>
                                                <Select
                                                    onValueChange={(val) => form.setData("transaction_type_id", val)}
                                                    value={form.data.transaction_type_id || ""}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select transaction type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {page.props.transactionTypes?.map((type) => (
                                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                                    {type.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="remarks" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Remarks
                                                </Label>
                                                <textarea
                                                    id="remarks"
                                                    value={form.data.remarks || ""}
                                                    onChange={(e) => form.setData("remarks", e.target.value)}
                                                    className="w-full rounded-lg border border-slate-300 p-3 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                                                    placeholder="Add any notes about this transaction"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                                            <Button
                                                onClick={handleNext}
                                                disabled={processing}
                                                size="lg"
                                                className="flex-1 py-5 text-base font-medium bg-emerald-500 hover:bg-emerald-600 text-white"
                                            >
                                                {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                                                Complete Transaction
                                            </Button>
                                            <Button
                                                onClick={handleOverride}
                                                disabled={processing}
                                                size="lg"
                                                variant="outline"
                                                className="flex-1 py-5 text-base font-medium border-rose-300 text-rose-600 hover:bg-rose-50"
                                            >
                                                {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <AlertCircle className="mr-2 h-5 w-5" />}
                                                Mark as No Show
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Tabs defaultValue="next-customer" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="next-customer">Next Customer</TabsTrigger>
                                            <TabsTrigger value="manual-serve">Manual Entry</TabsTrigger>
                                        </TabsList>
                                        
                                        <TabsContent value="next-customer" className="space-y-4 pt-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="customer-type" className="text-sm font-medium">
                                                    Customer Type
                                                </Label>
                                                <Select
                                                    onValueChange={(val) => {
                                                        setPriority(val);
                                                        form.setData("ispriority", val);
                                                    }}
                                                    value={priority}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select customer type" />
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
                                                className="w-full py-4 text-base font-medium"
                                            >
                                                {processing ? (
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Play className="mr-2 h-5 w-5" />
                                                        Call Next Customer
                                                    </>
                                                )}
                                            </Button>
                                        </TabsContent>
                                        
                                        <TabsContent value="manual-serve" className="space-y-4 pt-4">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="ticket-number" className="text-sm font-medium">
                                                        Ticket Number
                                                    </Label>
                                                    <div className="flex items-center">
                                                        <Ticket className="h-4 w-4 mr-2 text-slate-500" />
                                                        <Input
                                                            id="ticket-number"
                                                            type="text"
                                                            placeholder="Enter ticket number (e.g., A-001)"
                                                            value={manualOverrideNumber}
                                                            onChange={(e) => setManualOverrideNumber(e.target.value)}
                                                            className="w-full"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <Label htmlFor="manual-customer-type" className="text-sm font-medium">
                                                        Customer Type
                                                    </Label>
                                                    <Select
                                                        onValueChange={(val) => manualOverrideForm.setData("ispriority", val)}
                                                        value={manualOverrideForm.data.ispriority || "0"}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select customer type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectItem value="0">Regular</SelectItem>
                                                                <SelectItem value="1">Priority</SelectItem>
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            
                                            <Button
                                                onClick={handleManualOverride}
                                                disabled={processing || manualOverrideNumber.trim() === ""}
                                                size="lg"
                                                variant="outline"
                                                className="w-full py-4 text-base font-medium"
                                            >
                                                {processing ? (
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <UserCog className="mr-2 h-5 w-5" />
                                                        Serve This Customer
                                                    </>
                                                )}
                                            </Button>
                                        </TabsContent>
                                    </Tabs>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="flex-1 mt-6 md:mt-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                            <CardHeader className="border-b border-slate-200 bg-slate-50 pb-4 dark:border-slate-700 dark:bg-slate-700/50">
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                                    <Clock className="h-5 w-5 text-blue-500" /> Waiting Queue
                                </CardTitle>
                                <CardDescription>
                                    {waiting_list.length} customer(s) waiting
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {waiting_list.length > 0 ? (
                                    <div className="rounded-md border border-slate-200 dark:border-slate-700">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Ticket #</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-right">Priority</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {waiting_list.map((ticket) => (
                                                    <TableRow key={ticket.id} className={ticket.is_priority ? "bg-rose-50 dark:bg-rose-900/20" : ""}>
                                                        <TableCell className="font-medium">{ticket.number}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={ticket.status === "waiting" ? "outline" : "secondary"}>
                                                                {ticket.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {ticket.is_priority ? (
                                                                <Badge variant="destructive">Priority</Badge>
                                                            ) : (
                                                                <Badge variant="outline">Regular</Badge>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No customers in the waiting queue</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </AppLayout>
    );
}
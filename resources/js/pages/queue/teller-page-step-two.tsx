import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Loader2, User, Clock, CheckCircle, AlertCircle, ArrowRight, Play, UserCheck, Users, UserCog } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TellerPageProps = {
    current?: any;
    userTellerNumber?: string;
    transactionTypes?: { id: string; name: string }[];
    tellers?: { id: string; name: string }[];
    waiting_list: {
        id: number;
        number: string;
        transaction_type: { name: string };
        status: string;
        is_priority: boolean;
    }[];
};

export default function TellerPage({ current, waiting_list, userTellerNumber, transactionTypes = [], tellers = [] }: TellerPageProps) {
    const form = useForm({
        teller_id: userTellerNumber ?? tellers[0]?.id ?? '',
        transaction_type_id: transactionTypes[0]?.id ?? '',
        ispriority: '0',
    });
    const { processing } = form;

    const [selectedTeller, setSelectedTeller] = useState<string>(form.data.teller_id);
    const [selectedTransaction, setSelectedTransaction] = useState(form.data.transaction_type_id);
    const [showNoCustomersDialog, setShowNoCustomersDialog] = useState(false);
    const [priority, setPriority] = useState(form.data.ispriority);
    const [servingTab, setServingTab] = useState("current-customer");
    const [manualOverrideNumber, setManualOverrideNumber] = useState("");
    const [showSetupForm, setShowSetupForm] = useState(false);

    // Live clock
    const [now, setNow] = useState<Date>(new Date());
    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(id);
    }, []);

    const page = usePage<{ flash?: { error?: string; success?: string; confirm_reset?: boolean; message?: string } }>();

   useEffect(() => {
    if (page.props.flash?.confirm_reset) {
        setShowNoCustomersDialog(true);
    }
}, [page.props.flash]);

useEffect(() => {
    if (page.props.flash?.confirm_reset) {
        Swal.fire({
            title: "No Customers Found",
            text: page.props.flash?.message ?? 
                  "There are no more waiting customers for this Transaction Type and Status. Do you want to select a new Transaction Type and Status?",
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Yes, Select New Transaction",
            cancelButtonText: "No, Keep Waiting",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                handleSelectNew();
            } else {
                // User chose to keep waiting, just clear the flash
                router.reload({ only: ['flash'], preserveState: true });
            }
        });
    }
}, [page.props.flash]);

    function handleAssignTeller() {
        form.setData('teller_id', selectedTeller);
        form.setData('transaction_type_id', selectedTransaction);
        form.setData('ispriority', priority);
        form.post(route('queue.teller.assign.step2'), { 
            preserveState: true,
            onSuccess: () => {
                setShowSetupForm(false); // Hide setup form after successful assignment
            }
        });
    }

    const handleSelectNew = () => {
        setShowNoCustomersDialog(false);
        setShowSetupForm(true); // Show the setup form

        form.post(route("queue.teller.reset.step2"), {
            preserveState: false,
            onSuccess: () => {
                // Don't reset the selected values here, keep them for the setup form
                form.setData('transaction_type_id', '');
                form.setData('ispriority', '0');
                
                // Reload to get fresh props from backend
                router.reload({ only: ['userTellerNumber', 'current', 'waiting_list'] });
            }
        });
    };


    function handleGrab() {
        form.setData('ispriority', priority);
        form.post(route('queue.teller.grab.step2'));
    }

    function handleNext() {
        form.post(route('queue.teller.next.step2'), {
            onSuccess: () => {
                // Reset priority after completing transaction
                setPriority('0');
                form.setData('ispriority', '0');
            }
        });
    }

    function handleOverride() {
        form.post(route('queue.teller.override.step2'), {
            onSuccess: () => {
                setPriority('0');
                form.setData('ispriority', '0');
            }
        });
    }

    const manualOverrideForm = useForm({ number: "" });

    const handleManualOverride = () => {
        if (manualOverrideForm.data.number.trim() === "") {
            Swal.fire({
                icon: "warning",
                title: "Input Required",
                text: "Please enter a ticket number for the manual override.",
            });
            return;
        }

        // Validate 4-digit number
        const numberRegex = /^\d{4}$/;
        if (!numberRegex.test(manualOverrideForm.data.number)) {
            Swal.fire({
                icon: "error",
                title: "Invalid Format",
                text: "Please enter a 4-digit ticket number (e.g., 0001).",
            });
            return;
        }

        manualOverrideForm.post(route("queue.teller.step2.manual-override"), {
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: `Customer Already Served`,
                    text: `Ticket #${manualOverrideForm.data.number} has been already served.`,
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
                manualOverrideForm.reset();
            },
            onError: (errors) => {
                if (errors.number) {
                    Swal.fire({
                        toast: true,
                        position: "top-end",
                        icon: "error",
                        title: "Not Found",
                        text: `Ticket #${manualOverrideForm.data.number} is not found or not in the No Show list.`,
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                } else {
                    Swal.fire({
                        toast: true,
                        position: "top-end",
                        icon: "error",
                        title: "Error",
                        text: "Something went wrong while serving this customer.",
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            },
        });
    };

    function handleNoShow() {
        form.post(route('queue.teller.no-show.step2'));
    }

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
        if (page.props.flash?.error) {
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: "Error!",
                text: page.props.flash.error,
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        }
    }, [page.props.flash]);

    const breadcrumbs = [{ title: 'Service Counter', href: '/queue/teller-step2' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Step 2 - Service Counter" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-slate-900 dark:from-slate-900 dark:to-slate-800 dark:text-slate-100">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-600/20" />
                    <div className="absolute right-0 bottom-0 h-[28rem] w-[28rem] rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-600/15" />
                </div>

                {/* Header */}
                <header className="w-full border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-800/90">
                    <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-5 text-center md:py-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 md:text-3xl">
                                Service Counter - Step 2
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 font-mono text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                <Clock className="h-4 w-4" />
                                {now.toLocaleTimeString()}
                            </div>

                            {userTellerNumber ? (
                                <div className="flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    <UserCheck className="h-4 w-4" />
                                    Teller #{userTellerNumber}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                    <AlertCircle className="h-4 w-4" />
                                    Not Assigned
                                </div>
                            )}

                            <div className={`flex items-center gap-2 rounded-full px-4 py-2 ${processing
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                }`}>
                                <div className={`h-2 w-2 rounded-full ${processing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                                    }`} />
                                {processing ? 'Processing...' : 'Ready'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <Card className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                            <CardHeader className="border-b border-slate-200 bg-slate-50 pb-4 dark:border-slate-700 dark:bg-slate-700/50">
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                                    {(userTellerNumber && !showSetupForm) ? (
                                        <>
                                            <User className="h-5 w-5 text-blue-500" />
                                            Currently Serving
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-5 w-5 text-blue-500" />
                                            Start Serving Customers
                                        </>
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    {(userTellerNumber && !showSetupForm)
                                        ? (current ? "You are currently serving a customer" : "Ready to serve next customer")
                                        : "Select your teller station to begin serving customers"}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="pt-6">
                                {/* Show setup form when no teller is assigned OR when showSetupForm is true */}
                                {!userTellerNumber || showSetupForm ? (
                                    <div className="flex flex-col gap-6">
                                        <div className="text-center">
                                            <p className="text-slate-600 dark:text-slate-400">
                                                Select your teller station and transaction type to begin serving customers.
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="teller-station" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Teller Station
                                                </Label>
                                                <Select
                                                    onValueChange={(value) => {
                                                        setSelectedTeller(value);
                                                        form.setData('teller_id', value);
                                                    }}
                                                    value={selectedTeller ?? ''}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select your teller station" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {tellers.map((t) => (
                                                                <SelectItem key={t.id} value={String(t.id)}>
                                                                    {t.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="transaction-type" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Transaction Type
                                                </Label>
                                                <Select
                                                    onValueChange={(value) => {
                                                        setSelectedTransaction(value);
                                                        form.setData('transaction_type_id', value);
                                                    }}
                                                    value={selectedTransaction}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select transaction type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {transactionTypes.map((t) => (
                                                                <SelectItem key={t.id} value={t.id}>
                                                                    {t.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="customer-type" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Client Type
                                                </Label>
                                                <Select
                                                    onValueChange={(value) => {
                                                        setPriority(value);
                                                        form.setData('ispriority', value);
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
                                        </div>

                                        <Button
                                            onClick={handleAssignTeller}
                                            disabled={!selectedTeller || !selectedTransaction || processing}
                                            size="lg"
                                            className="w-full py-6 text-base font-medium"
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Starting...
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="mr-2 h-5 w-5" />
                                                    {showSetupForm ? "Update Selection" : "Start Serving"}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ) : current ? (
                                    // Currently serving a customer
                                    <Tabs value={servingTab} onValueChange={setServingTab} className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 mb-4">
                                            <TabsTrigger value="current-customer">Current Customer</TabsTrigger>
                                            <TabsTrigger value="manual-serve-current">Manual Entry</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="current-customer" className="space-y-6">
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

                                            <div className="w-full space-y-3">
                                                <div className="flex justify-between items-center p-3 bg-slate-100 rounded-lg dark:bg-slate-700">
                                                    <span className="text-slate-600 dark:text-slate-400">Transaction Type</span>
                                                    <span className="font-medium">{current.transaction_type?.name}</span>
                                                </div>

                                                <div className="flex justify-between items-center p-3 bg-slate-100 rounded-lg dark:bg-slate-700">
                                                    <span className="text-slate-600 dark:text-slate-400">Teller Station</span>
                                                    <span className="font-medium text-blue-600 dark:text-blue-400">#{userTellerNumber}</span>
                                                </div>

                                                {current.remarks ? (
                                                    <div className="p-4 border-l-4 border-amber-500 bg-amber-50 rounded-lg dark:bg-amber-900/20 dark:border-amber-400 shadow-sm">
                                                        <div className="flex items-start gap-2">
                                                            <span className="font-semibold text-amber-700 dark:text-amber-300 min-w-[150px]">
                                                                Remarks from Step 1:
                                                            </span>
                                                            <span className="font-medium text-slate-900 dark:text-slate-100 flex-1">
                                                                {current.remarks}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-4 border-l-4 border-slate-400 bg-slate-100 rounded-lg dark:bg-slate-700 dark:border-slate-500 shadow-sm">
                                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                            <span>No remarks from Step 1</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-3 w-full">
                                                <Button
                                                    onClick={handleNext}
                                                    disabled={processing}
                                                    size="lg"
                                                    className="flex-1 py-5 text-base font-medium bg-emerald-500 hover:bg-emerald-600 text-white"
                                                >
                                                    {processing ? (
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="mr-2 h-5 w-5" />
                                                            Complete Transaction
                                                        </>
                                                    )}
                                                </Button>

                                                <Button
                                                    onClick={handleOverride}
                                                    disabled={processing}
                                                    size="lg"
                                                    variant="outline"
                                                    className="flex-1 py-5 text-base font-medium border-rose-300 text-rose-600 hover:bg-rose-50"
                                                >
                                                    {processing ? (
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <AlertCircle className="mr-2 h-5 w-5" />
                                                            Mark as No Show
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="manual-serve-current" className="space-y-4">
                                            <div className="text-center p-4">
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                    Manually serve a customer who is not in the waiting list
                                                </p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="ticket-number-step2" className="text-sm font-medium">
                                                        Ticket Number
                                                    </Label>
                                                    <div className="flex items-center">
                                                        <Input
                                                            id="manual-ticket-number"
                                                            type="text"
                                                            placeholder="Enter 4-digit ticket number (e.g., 0001)"
                                                            // CORRECTED: Bind to the form state
                                                            value={manualOverrideForm.data.number}
                                                            onChange={(e) => manualOverrideForm.setData("number", e.target.value)}
                                                            className="w-full"
                                                            maxLength={4}
                                                            pattern="[0-9]{4}"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        Must be a 4-digit number
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={handleManualOverride}
                                                // CORRECTED: Check the form state
                                                disabled={processing || manualOverrideForm.data.number.trim() === ""}
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
                                ) : (
                                    // Ready to grab next customer
                                    <Tabs defaultValue={!userTellerNumber ? "setup" : "now-serving"} className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            {!userTellerNumber ? (
                                                <TabsTrigger value="setup">Initial Setup</TabsTrigger>
                                            ) : (
                                                <TabsTrigger value="now-serving">Now Serving</TabsTrigger>
                                            )}
                                            <TabsTrigger value="manual-override">Manual Entry</TabsTrigger>
                                        </TabsList>

                                        {/* Initial Setup */}
                                        {!userTellerNumber && (
                                            <TabsContent value="setup" className="space-y-4 pt-4">
                                                {/* keep your teller + transaction + priority setup form here */}
                                            </TabsContent>
                                        )}

                                        {/* Now Serving */}
                                        {userTellerNumber && (
                                            <TabsContent value="now-serving" className="space-y-4 pt-4">
                                                {current ? (
                                                    // Currently serving
                                                    <div className="flex flex-col gap-6">
                                                        <div className="text-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Now Serving</p>
                                                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 bg-clip-text text-6xl font-bold tracking-wider text-transparent tabular-nums md:text-7xl">
                                                                {current.number}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row gap-3">
                                                            <Button onClick={handleNext} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white">
                                                                <CheckCircle className="mr-2 h-5 w-5" /> Complete Transaction
                                                            </Button>
                                                            <Button onClick={handleOverride} className="flex-1 border-rose-300 text-rose-600 hover:bg-rose-50" variant="outline">
                                                                <AlertCircle className="mr-2 h-5 w-5" /> Mark as No Show
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Ready to grab next customer → NO customer type selection
                                                    <div className="space-y-4">
                                                        <Button onClick={handleGrab} className="w-full py-4">
                                                            <ArrowRight className="mr-2 h-5 w-5" /> Call Next Customer
                                                        </Button>
                                                    </div>
                                                )}
                                            </TabsContent>
                                        )}

                                        {/* Manual Override - UPDATED TO MATCH MANUAL ENTRY */}
                                        <TabsContent value="manual-override" className="space-y-4 pt-4">
                                            <div className="text-center p-4">
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                    Manually serve a customer who is not in the waiting list
                                                </p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="manual-ticket-number" className="text-sm font-medium">
                                                        Ticket Number
                                                    </Label>
                                                    <div className="flex items-center">
                                                        <Input
                                                            id="manual-ticket-number"
                                                            type="text"
                                                            placeholder="Enter 4-digit ticket number (e.g., 0001)"
                                                            // CORRECTED: Bind to the form state
                                                            value={manualOverrideForm.data.number}
                                                            onChange={(e) => manualOverrideForm.setData("number", e.target.value)}
                                                            className="w-full"
                                                            maxLength={4}
                                                            pattern="[0-9]{4}"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        Must be a 4-digit number
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={handleManualOverride}
                                                // CORRECTED: Check the form state
                                                disabled={processing || manualOverrideForm.data.number.trim() === ""}
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

                        {/* Waiting List Card */}
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
                                                    <TableHead>Transaction</TableHead>
                                                    <TableHead >Category</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {waiting_list.map((ticket) => (
                                                    <TableRow key={ticket.id} className={ticket.is_priority ? "bg-rose-50 dark:bg-rose-900/20" : ""}>
                                                        <TableCell className="font-medium">{ticket.number}</TableCell>
                                                        <TableCell>{ticket.transaction_type.name}</TableCell>
                                                        <TableCell >
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

                    {/* Help text for non-technical users */}
                    <div className="mt-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium">Need help?</p>
                                <ul className="mt-2 list-disc space-y-1 pl-5">
                                    <li>Click "Call Next Customer" to serve the next person in line</li>
                                    <li>Click "Complete Transaction" when finished with the current customer</li>
                                    <li>Use "Mark as No Show" if the customer doesn't arrive after being called</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AppLayout>
    );
}
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
import LoadingOverlay from '@/components/loading-overlay';
import Box from '@/components/ui/box';

type Ticket = {
    id: number;
    number: string;
    transaction_type?: { name: string };
    status: string;
    is_priority: boolean;
    remarks?: string;
};

type TellerPageProps = {
    current?: Ticket; // Changed to use the Ticket type
    userTellerNumber?: string;
    transactionTypes?: { id: string; name: string }[];
    tellers?: { id: string; name: string }[];
    waiting_list: Ticket[]; // Changed to use the Ticket type
    no_show_list: Ticket[]; // Changed to use the Ticket type
};

// 💡 NEW HELPER FUNCTION TO FORMAT THE TICKET NUMBER
function formatTicketNumber(number: string, isPriority: boolean): string {
    // 1. Remove non-numeric characters (in case the backend number is not clean)
    let cleanNum = number.toString().replace(/[^0-9]/g, '');

    // 2. Pad the numeric part to 4 digits
    const paddedNum = cleanNum.padStart(4, '0');

    // 3. Prepend the correct prefix
    const prefix = isPriority ? 'P' : 'R';

    return prefix + paddedNum;
}

export default function TellerPage({ current, waiting_list, no_show_list, userTellerNumber, transactionTypes = [], tellers = [] }: TellerPageProps) {
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
    const showLoading = form.processing;

    // Live clock
    const [now, setNow] = useState<Date>(new Date());
    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(id);
    }, []);

    const page = usePage<{ flash?: { error?: string; success?: string; confirm_reset?: boolean; message?: string; no_found?: string } }>();

    useEffect(() => {
        if (page.props.flash?.confirm_reset) {
            setShowNoCustomersDialog(true);
        }
    }, [page.props.flash]);

    useEffect(() => {
        // Consolidated Toast/Dialog logic
        const commonConfig = {
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            toast: true,
            timerProgressBar: true,
        };

        const { flash } = page.props;

        if (flash?.confirm_reset) {
            Swal.fire({
                title: "No Customers Found",
                text: flash?.message ?? "There are no more waiting customers for this Transaction Type and Status. Do you want to select a new Transaction Type and Status?",
                icon: "info",
                showCancelButton: true,
                confirmButtonText: "Yes, Select New Transaction",
                cancelButtonText: "No, Keep Waiting",
                reverseButtons: true,
            }).then((result) => {
                if (result.isConfirmed) {
                    handleSelectNew();
                } else {
                    router.reload({ only: ['flash'], preserveState: true });
                }
            });
        }
        else if (flash?.success)
            Swal.fire({ ...commonConfig, icon: "success", title: "Success!", text: flash.success, toast: true });
        else if (flash?.no_found)
            Swal.fire({ ...commonConfig, icon: "error", title: "Not Found!", text: flash.no_found, toast: true });
        else if (flash?.error)
            Swal.fire({ ...commonConfig, icon: "error", title: "Error!", text: flash.error, toast: true });
        else if (flash?.message)
            Swal.fire({ ...commonConfig, icon: "info", title: "Notice", text: flash.message, toast: true });

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
        // 💡 CHANGE 1: Use formatted number in the confirmation dialog
        const formattedNumber = current ? formatTicketNumber(current.number, current.is_priority) : 'current customer';

        Swal.fire({
            title: 'Are you sure?',
            text: `Mark ticket ${formattedNumber} as "No Show"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, mark as no show!'
        }).then((result) => {
            if (result.isConfirmed) {
                form.post(route('queue.teller.override.step2'), {
                    onSuccess: () => {
                        setPriority('0');
                        form.setData('ispriority', '0');
                    }
                });
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

        // The user should enter the 4-digit number *without* the P/R prefix
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
                // 💡 NOTE: The ticket number here is the raw 4-digit number. 
                // We'll display it as the raw number for consistency with the input field.
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

    const breadcrumbs = [{ title: 'Service Counter', href: '/queue/teller-step2' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <LoadingOverlay visible={showLoading} title="Processing Request…" message="Please wait while we update the queue." />


            <Head title="Step 2 - Service Counter" />
            <Box className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-slate-900 dark:from-slate-900 dark:to-slate-800 dark:text-slate-100">
                <Box className="pointer-events-none absolute inset-0 overflow-hidden">
                    <Box className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-600/20" />
                    <Box className="absolute right-0 bottom-0 h-[28rem] w-[28rem] rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-600/15" />
                </Box>

                {/* Header */}
                <header className="w-full border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-800/90">
                    <Box className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-5 text-center md:py-6">
                        <Box className="flex items-center gap-3">
                            <Box className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </Box>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 md:text-3xl">
                                Service Counter - Step 2
                            </h1>
                        </Box>

                        <Box className="flex flex-wrap items-center justify-center gap-3">
                            <Box className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 font-mono text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                <Clock className="h-4 w-4" />
                                {now.toLocaleTimeString()}
                            </Box>

                            {userTellerNumber ? (
                                <Box className="flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    <UserCheck className="h-4 w-4" />
                                    Teller #{userTellerNumber}
                                </Box>
                            ) : (
                                <Box className="flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                    <AlertCircle className="h-4 w-4" />
                                    Not Assigned
                                </Box>
                            )}

                            <Box className={`flex items-center gap-2 rounded-full px-4 py-2 ${processing
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                }`}>
                                <Box className={`h-2 w-2 rounded-full ${processing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                                    }`} />
                                {processing ? 'Processing...' : 'Ready'}
                            </Box>
                        </Box>
                    </Box>
                </header>

                {/* Main Content */}
                <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
                    <Box className="flex flex-col md:flex-row gap-6">
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
                                    <Box className="flex flex-col gap-6">
                                        <Box className="text-center">
                                            <p className="text-slate-600 dark:text-slate-400">
                                                Select your teller station and transaction type to begin serving customers.
                                            </p>
                                        </Box>

                                        <Box className="space-y-4">
                                            <Box>
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
                                            </Box>

                                            <Box>
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
                                            </Box>

                                            <Box>
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
                                            </Box>
                                        </Box>

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
                                    </Box>
                                ) : current ? (
                                    // Currently serving a customer
                                    <Tabs value={servingTab} onValueChange={setServingTab} className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 mb-4">
                                            <TabsTrigger value="current-customer">Current Customer</TabsTrigger>
                                            <TabsTrigger value="manual-serve-current">Manual Entry</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="current-customer" className="space-y-6">
                                            <Box className="text-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Now Serving</p>
                                                <Box className="bg-gradient-to-br from-blue-500 to-indigo-600 bg-clip-text text-6xl font-bold tracking-wider text-transparent tabular-nums md:text-7xl">
                                                    {/* 💡 CHANGE 2: Display formatted ticket number */}
                                                    {formatTicketNumber(current.number, current.is_priority)}
                                                </Box>
                                                <Box className="mt-2">
                                                    <Badge variant={current.is_priority ? "destructive" : "secondary"}>
                                                        {current.is_priority ? "Priority" : "Regular"}
                                                    </Badge>
                                                </Box>
                                            </Box>

                                            <Box className="w-full space-y-3">
                                                <Box className="flex justify-between items-center p-3 bg-slate-100 rounded-lg dark:bg-slate-700">
                                                    <span className="text-slate-600 dark:text-slate-400">Transaction Type</span>
                                                    <span className="font-medium">{current.transaction_type?.name}</span>
                                                </Box>

                                                <Box className="flex justify-between items-center p-3 bg-slate-100 rounded-lg dark:bg-slate-700">
                                                    <span className="text-slate-600 dark:text-slate-400">Teller Station</span>
                                                    <span className="font-medium text-blue-600 dark:text-blue-400">#{userTellerNumber}</span>
                                                </Box>

                                                {current.remarks ? (
                                                    <Box className="p-4 border-l-4 border-amber-500 bg-amber-50 rounded-lg dark:bg-amber-900/20 dark:border-amber-400 shadow-sm">
                                                        <Box className="flex items-start gap-2">
                                                            <span className="font-semibold text-amber-700 dark:text-amber-300 min-w-[150px]">
                                                                Remarks from Step 1:
                                                            </span>
                                                            <span className="font-medium text-slate-900 dark:text-slate-100 flex-1">
                                                                {current.remarks}
                                                            </span>
                                                        </Box>
                                                    </Box>
                                                ) : (
                                                    <Box className="p-4 border-l-4 border-slate-400 bg-slate-100 rounded-lg dark:bg-slate-700 dark:border-slate-500 shadow-sm">
                                                        <Box className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                            <span>No remarks from Step 1</span>
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Box>

                                            <Box className="flex flex-col sm:flex-row gap-3 w-full">
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
                                            </Box>
                                        </TabsContent>

                                        <TabsContent value="manual-serve-current" className="space-y-4">
                                            <Box className="text-center p-4">
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                    Manually serve a customer who is not in the waiting list
                                                </p>
                                            </Box>

                                            <Box className="space-y-4">
                                                <Box className="space-y-2">
                                                    <Label htmlFor="ticket-number-step2" className="text-sm font-medium">
                                                        Ticket Number (Raw)
                                                    </Label>
                                                    <Box className="flex items-center">
                                                        <Input
                                                            id="manual-ticket-number"
                                                            type="text"
                                                            placeholder="Enter 4-digit ticket number (e.g., 0001)"
                                                            value={manualOverrideForm.data.number}
                                                            onChange={(e) => manualOverrideForm.setData("number", e.target.value)}
                                                            className="w-full"
                                                            maxLength={4}
                                                            pattern="[0-9]{4}"
                                                        />
                                                    </Box>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        Enter the 4-digit number only (e.g. 0001, not R0001)
                                                    </p>
                                                </Box>
                                            </Box>
                                            <Button
                                                onClick={handleManualOverride}
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
                                    // Ready to serve next customer (Teller assigned, but no current customer)
                                    <Box className="text-center p-6 space-y-4">
                                        <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                                            Ready to call the next customer.
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            You are currently serving **{transactionTypes.find(t => t.id === form.data.transaction_type_id)?.name}** customers with **{priority === '1' ? 'Priority' : 'Regular'}** status.
                                        </p>
                                        <Button
                                            onClick={handleGrab}
                                            disabled={processing}
                                            size="lg"
                                            className="w-full py-6 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Calling...
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="mr-2 h-5 w-5" />
                                                    Call Next Customer
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={() => setShowSetupForm(true)}
                                            disabled={processing}
                                            size="sm"
                                            variant="ghost"
                                            className="w-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                        >
                                            Change Selection
                                        </Button>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Queue and No Show List */}
                        <Card className="flex-1 mt-6 md:mt-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                            <CardHeader className="border-b border-slate-200 bg-slate-50 pb-4 dark:border-slate-700 dark:bg-slate-700/50">
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                                    <Clock className="h-5 w-5 text-blue-500" /> Client Queue
                                </CardTitle>
                                <CardDescription>
                                    {waiting_list.length} waiting • {no_show_list.length} no show
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Tabs defaultValue="waiting" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 mb-4">
                                        <TabsTrigger value="waiting">Waiting</TabsTrigger>
                                        <TabsTrigger value="no-show">No Show</TabsTrigger>
                                    </TabsList>

                                    {/* Waiting List */}
                                    <TabsContent value="waiting">
                                        {waiting_list.length > 0 ? (
                                            <Box className="overflow-auto max-h-[400px]">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-[120px]">Ticket No.</TableHead>
                                                            <TableHead>Type</TableHead>
                                                            <TableHead>Transaction</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {waiting_list.map((ticket) => (
                                                            <TableRow key={ticket.id}>
                                                                <TableCell className="font-medium text-lg">
                                                                    {/* 💡 CHANGE 3: Display formatted ticket number in Waiting List */}
                                                                    {formatTicketNumber(ticket.number, ticket.is_priority)}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant={ticket.is_priority ? "destructive" : "secondary"}>
                                                                        {ticket.is_priority ? "Priority" : "Regular"}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-sm">
                                                                    {ticket.transaction_type?.name ?? 'N/A'}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </Box>
                                        ) : (
                                            <p className="text-center py-8 text-slate-500 dark:text-slate-400">No clients currently waiting for your selection.</p>
                                        )}
                                    </TabsContent>

                                    {/* No Show List */}
                                    <TabsContent value="no-show">
                                        {no_show_list.length > 0 ? (
                                            <Box className="overflow-auto max-h-[400px]">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-[120px]">Ticket No.</TableHead>
                                                            <TableHead>Type</TableHead>
                                                            <TableHead>Transaction</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {no_show_list.map((ticket) => (
                                                            <TableRow key={ticket.id} className="opacity-70">
                                                                <TableCell className="font-medium">
                                                                    {/* 💡 CHANGE 4: Display formatted ticket number in No Show List */}
                                                                    {formatTicketNumber(ticket.number, ticket.is_priority)}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant={ticket.is_priority ? "destructive" : "secondary"}>
                                                                        {ticket.is_priority ? "Priority" : "Regular"}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-sm">
                                                                    {ticket.transaction_type?.name ?? 'N/A'}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </Box>
                                        ) : (
                                            <p className="text-center py-8 text-slate-500 dark:text-slate-400">No clients currently marked as No Show.</p>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </Box>
                </main>
            </Box>
        </AppLayout>
    );
}
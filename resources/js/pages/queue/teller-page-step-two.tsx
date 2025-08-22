import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Loader2, User, Clock, CheckCircle, AlertCircle, ArrowRight, Play, UserCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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

    // Live clock
    const [now, setNow] = useState<Date>(new Date());
    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(id);
    }, []);

    const page = usePage<{ flash?: { error?: string; success?: string; confirm_reset?: boolean } }>();

    useEffect(() => {
        if (page.props.flash?.confirm_reset) {
            setShowNoCustomersDialog(true);
        }
    }, [page.props.flash?.confirm_reset]);

    function handleAssignTeller() {
        form.setData('teller_id', selectedTeller);
        form.setData('transaction_type_id', selectedTransaction);
        form.setData('ispriority', priority);
        form.post(route('queue.teller.assign.step2'), { preserveState: true });
    }

    const handleSelectNew = () => {
        setShowNoCustomersDialog(false);

        form.post(route("queue.teller.reset.step2"), {
            preserveState: false,
            onSuccess: () => {
                // Reset frontend state
                setSelectedTransaction('');
                setPriority('0');
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
    function handleNoShow() {
        form.post(route('queue.teller.no-show.step2'));
    }



    const breadcrumbs = [{ title: 'Service Counter', href: '/queue/teller' }];

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
                                    {userTellerNumber ? (
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
                                    {userTellerNumber
                                        ? (current ? "You are currently serving a customer" : "Ready to serve next customer")
                                        : "Select your teller station to begin serving customers"}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="pt-6">
                                {/* Not assigned to a teller */}
                                {!userTellerNumber ? (
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
                                                    Customer Type
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
                                                    Start Serving
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ) : current ? (
                                    // Currently serving a customer
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

                                        <div className="w-full space-y-3">
                                            <div className="flex justify-between items-center p-3 bg-slate-100 rounded-lg dark:bg-slate-700">
                                                <span className="text-slate-600 dark:text-slate-400">Transaction Type</span>
                                                <span className="font-medium">{current.transaction_type?.name}</span>
                                            </div>

                                            <div className="flex justify-between items-center p-3 bg-slate-100 rounded-lg dark:bg-slate-700">
                                                <span className="text-slate-600 dark:text-slate-400">Teller Station</span>
                                                <span className="font-medium text-blue-600 dark:text-blue-400">#{userTellerNumber}</span>
                                            </div>
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
                                    </div>
                                ) : (
                                    // Ready to grab next customer
                                    <Tabs defaultValue={!userTellerNumber ? "setup" : "now-serving"} className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            {!userTellerNumber ? (
                                                <TabsTrigger value="setup">Initial Setup</TabsTrigger>
                                            ) : (
                                                <TabsTrigger value="now-serving">Now Serving</TabsTrigger>
                                            )}
                                            <TabsTrigger value="manual-override">Manual Override</TabsTrigger>
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

                                        {/* Manual Override */}
                                        <TabsContent value="manual-override" className="space-y-4 pt-4">
                                            <div>
                                                <Label className="mb-2 block text-sm font-medium">Transaction Type</Label>
                                                <Select
                                                    value={selectedTransaction}
                                                    onValueChange={(val) => {
                                                        setSelectedTransaction(val);
                                                        form.setData("transaction_type_id", val);
                                                    }}
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
                                                <Label className="mb-2 block text-sm font-medium">Customer Type</Label>
                                                <Select
                                                    value={priority}
                                                    onValueChange={(val) => {
                                                        setPriority(val);
                                                        form.setData("ispriority", val);
                                                    }}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select customer type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="0">Regular</SelectItem>
                                                        <SelectItem value="1">Priority</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label className="mb-2 block text-sm font-medium">Ticket Number</Label>
                                                <input
                                                    type="text"
                                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                                                    placeholder="Enter ticket number"
                                                    onChange={(e) => form.setData("ticket_number", e.target.value)}
                                                />
                                            </div>

                                            <Button
                                                onClick={handleOverride}
                                                className="w-full border-rose-300 text-rose-600 hover:bg-rose-50"
                                                variant="outline"
                                            >
                                                <AlertCircle className="mr-2 h-5 w-5" /> Override / Serve Specific Ticket
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

            <AlertDialog open={showNoCustomersDialog} onOpenChange={setShowNoCustomersDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>No Customers Found</AlertDialogTitle>
                        <AlertDialogDescription>
                            {page.props.flash?.message ??
                                "There are no more waiting customers for this Transaction Type and Status. Do you want to select a new Transaction Type and Status?"}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowNoCustomersDialog(false)}>
                            No, Keep Waiting
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleSelectNew}>
                            Yes, Select New Transaction
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
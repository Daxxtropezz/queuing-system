import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Loader2, User, Clock, CheckCircle, AlertCircle, ArrowRight, Play, UserCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';



type TellerPageProps = {
    current?: any;
    userTellerNumber?: string;
    transactionTypes?: { id: string; name: string }[];
    tellers?: { id: string; name: string }[];
};

export default function TellerPage({ current, userTellerNumber, transactionTypes = [], tellers = [] }: TellerPageProps) {
    const form = useForm({
        teller_id: userTellerNumber ?? tellers[0]?.id ?? '',
        transaction_type_id: transactionTypes[0]?.id ?? '',
        ispriority: '0',
    });
    const { processing } = form;

    const [selectedTeller, setSelectedTeller] = useState<string>(form.data.teller_id);
    const [selectedTransaction, setSelectedTransaction] = useState(form.data.transaction_type_id);

    // Live clock
    const [now, setNow] = useState<Date>(new Date());
    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(id);
    }, []);

    const page = usePage<{ flash?: { error?: string; success?: string; reset_teller?: boolean } }>();

    useEffect(() => {
        if (page.props.flash?.reset_teller) {
            // Reset teller setup state
            setSelectedTeller('');
            setSelectedTransaction('');
            form.setData('teller_id', '');
            form.setData('transaction_type_id', '');
        }
    }, [page.props.flash?.reset_teller]);

    function handleAssignTeller() {
        form.setData('teller_id', selectedTeller);
        form.setData('transaction_type_id', selectedTransaction);
        form.post(route('queue.teller.assign'), { preserveState: true });
    }

    function handleGrab() {
        form.post(route('queue.teller.grab'));
    }

    function handleNext() {
        form.post(route('queue.teller.next'));
    }

    function handleOverride() {
        form.post(route('queue.teller.override'));
    }

    const breadcrumbs = [{ title: 'Service Counter', href: '/queue/teller' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Service Counter" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-slate-900 dark:from-slate-900 dark:to-slate-800 dark:text-slate-100">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-600/20" />
                    <div className="absolute right-0 bottom-0 h-[28rem] w-[28rem] rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-600/15" />
                </div>

                {/* Header */}
                <header className="w-full border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-slate-700 dark:bg-slate-800/90">
                    <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-5 text-center md:py-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 md:text-3xl">
                                Service Counter
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
                <main className="mx-auto max-w-3xl px-4 py-8 md:px-6">
                    <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
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
                                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Teller Station
                                            </label>
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
                                                        <SelectLabel>Teller Stations</SelectLabel>
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
                                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Transaction Type
                                            </label>
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
                                                        <SelectLabel>Transaction Types</SelectLabel>
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
                                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Customer Status
                                            </label>
                                            <Select
                                                onValueChange={(value) => {
                                                    form.setData('ispriority', value);
                                                }}
                                                value={form.data.ispriority ?? ''}
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
                                <div className="flex flex-col items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Now Serving</p>
                                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 bg-clip-text text-6xl font-bold tracking-wider text-transparent tabular-nums md:text-7xl">
                                            {current.number}
                                        </div>
                                    </div>

                                    <div className="w-full space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-slate-100 rounded-lg dark:bg-slate-700">
                                            <span className="text-slate-600 dark:text-slate-400">Transaction Type</span>
                                            <span className="font-medium">{current.transaction_type?.name}</span>
                                        </div>

                                        <div className="flex justify-between items-center p-3 bg-slate-100 rounded-lg dark:bg-slate-700">
                                            <span className="text-slate-600 dark:text-slate-400">Priority</span>
                                            <span className={`font-medium ${current.ispriority ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                {current.ispriority ? 'Priority' : 'Regular'}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center p-3 bg-slate-100 rounded-lg dark:bg-slate-700">
                                            <span className="text-slate-600 dark:text-slate-400">Teller Station</span>
                                            <span className="font-medium text-blue-600 dark:text-blue-400">#{userTellerNumber}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 w-full">
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
                                                    Complete & Next
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            onClick={handleOverride}
                                            disabled={processing}
                                            size="lg"
                                            variant="outline"
                                            className="flex-1 py-5 text-base font-medium border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/30"
                                        >
                                            {processing ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <AlertCircle className="mr-2 h-5 w-5" />
                                                    No Show
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                // Ready to grab next customer
                                <div className="flex flex-col items-center gap-6">
                                    <div className="rounded-full bg-blue-100 p-5 dark:bg-blue-900/30">
                                        <User className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                                    </div>

                                    <div className="text-center">
                                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                                            Ready for Next Customer
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400">
                                            Click the button below to call the next customer in line.
                                        </p>
                                    </div>

                                    <Button
                                        onClick={handleGrab}
                                        disabled={processing}
                                        size="lg"
                                        className="w-full py-6 text-base font-medium"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Calling...
                                            </>
                                        ) : (
                                            <>
                                                <ArrowRight className="mr-2 h-5 w-5" />
                                                Call Next Customer
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

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
                                    <li>Click "Complete & Next" when finished with the current customer</li>
                                    <li>Use "No Show" if the customer doesn't arrive after being called</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AppLayout>
    );
}
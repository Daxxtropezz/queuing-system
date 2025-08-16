import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type TellerPageProps = {
    current?: any;
    userTellerNumber?: string;
    transactionTypes?: { id: string; name: string }[];
    tellers?: { id: string; name: string }[];
};

export default function TellerPage({ current, userTellerNumber, transactionTypes = [], tellers = [] }: TellerPageProps) {


    // Single useForm
    const form = useForm({
        teller_id: userTellerNumber ?? tellers[0]?.id ?? '',
        transaction_type_id: transactionTypes[0]?.id ?? '',
    });
    const { processing } = form;

    // Keep state synced
    const [selectedTeller, setSelectedTeller] = useState<string>(form.data.teller_id);
    const [selectedTransaction, setSelectedTransaction] = useState(form.data.transaction_type_id);

    // Live clock like main-page
    const [now, setNow] = useState<Date>(new Date());
    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(id);
    }, []);

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

    const breadcrumbs = [{ title: 'Teller', href: '/queue/teller' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Teller" />
            <div className="relative min-h-screen bg-gradient-to-br from-white via-slate-50 to-white text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl dark:bg-blue-600/20" />
                    <div className="absolute right-0 bottom-0 h-[28rem] w-[28rem] rounded-full bg-red-500/10 blur-3xl dark:bg-red-600/15" />
                </div>

                <header className="relative z-10 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/65 dark:border-slate-800/70 dark:bg-slate-900/70">
                    <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-6 text-center md:py-8">
                        <h1 className="bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-3xl font-extrabold tracking-[0.18em] text-transparent uppercase drop-shadow-sm md:text-5xl dark:from-amber-300 dark:via-yellow-200 dark:to-amber-400">
                            Teller Panel
                        </h1>
                        <div className="flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm">
                            <div className="rounded-full bg-slate-200/70 px-4 py-1 font-mono text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                                {now.toLocaleTimeString()}
                            </div>
                            {userTellerNumber ? (
                                <div className="rounded-full bg-blue-100 px-4 py-1 font-semibold tracking-wide text-blue-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                                    Teller #{userTellerNumber}
                                </div>
                            ) : (
                                <div className="rounded-full bg-rose-100 px-4 py-1 font-semibold tracking-wide text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                                    Not Assigned
                                </div>
                            )}
                            <div
                                className={[
                                    'rounded-full px-4 py-1',
                                    processing
                                        ? 'bg-yellow-200/70 text-yellow-800 dark:bg-amber-500/10 dark:text-amber-300'
                                        : 'bg-emerald-200/70 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300',
                                ].join(' ')}
                            >
                                <span
                                    className={[
                                        'mr-2 inline-block h-2 w-2 rounded-full align-middle',
                                        processing ? 'animate-pulse bg-yellow-500 dark:bg-amber-400' : 'bg-emerald-600 dark:bg-emerald-400',
                                    ].join(' ')}
                                />
                                {processing ? 'Working…' : 'Ready'}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="relative z-10 mx-auto max-w-3xl px-4 py-8 md:px-6">
                    <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/70">
                        <CardHeader className="border-b border-slate-200 pb-4 dark:border-slate-800/70">
                            <CardTitle className="bg-gradient-to-br from-slate-800 to-slate-500 bg-clip-text text-xl font-semibold tracking-wide text-transparent dark:from-slate-200 dark:to-slate-400">
                                {userTellerNumber ? 'Session' : 'Get Started'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {!userTellerNumber ? (
                                <div className="flex flex-col items-center gap-5">
                                    <p className="text-sm text-slate-400">Please select your teller number to begin.</p>
                                    <Select
                                        onValueChange={(value) => {
                                            setSelectedTeller(value);
                                            form.setData('teller_id', value);
                                        }}
                                        value={selectedTeller ?? ''}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a teller" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Tellers</SelectLabel>
                                                {tellers.map((t) => (
                                                    <SelectItem key={t.id} value={String(t.id)}>
                                                        {t.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>

                                    {/* Transaction select */}
                                    <Select
                                        onValueChange={(value) => {
                                            setSelectedTransaction(value);
                                            form.setData('transaction_type_id', value);
                                        }}
                                        value={selectedTransaction}
                                    >
                                        <SelectTrigger>
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

                                    {/* Assign button */}
                                    <Button
                                        onClick={handleAssignTeller}
                                        disabled={!selectedTeller || !selectedTransaction || processing}
                                    >
                                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Assign Teller
                                    </Button>
                                </div>
                            ) : current ? (
                                <div className="flex flex-col items-center gap-6">
                                    <div className="bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-6xl font-extrabold tracking-wider text-transparent tabular-nums drop-shadow md:text-7xl">
                                        {current.number}
                                    </div>
                                    <div className="rounded-xl border border-slate-700/60 bg-slate-800/70 px-4 py-2 text-center text-sm font-medium tracking-wide text-slate-200">
                                        {current.transaction_type?.name}
                                    </div>
                                    <div className="rounded-full bg-indigo-500/15 px-4 py-1 text-xs font-semibold tracking-wider text-indigo-300 uppercase">
                                        Now Serving at Teller {userTellerNumber}
                                    </div>
                                    <Button
                                        onClick={handleNext}
                                        disabled={processing}
                                        size="lg"
                                        className="w-full rounded-xl bg-amber-400 text-slate-900 hover:bg-amber-300 focus:ring-4 focus:ring-amber-400/30"
                                    >
                                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Next
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-5">
                                    <p className="text-sm text-slate-400">No current queue number assigned.</p>
                                    <Button
                                        onClick={handleGrab}
                                        disabled={processing}
                                        size="lg"
                                        className="w-full rounded-xl bg-emerald-500 text-slate-900 hover:bg-emerald-400 focus:ring-4 focus:ring-emerald-400/30"
                                    >
                                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Grab Next Number
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </AppLayout>
    );
}

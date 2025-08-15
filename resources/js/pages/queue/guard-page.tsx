import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

export default function GuardPage({ transactionTypes = [] }: { transactionTypes?: any[] }) {
    // The useForm hook already handles the data. You don't need separate states for transactionTypeId and clientType.
    const { data, setData, post, processing, errors, reset } = useForm({
        transaction_type_id: '',
        ispriority: 0,
    });

    const [dialogOpen, setDialogOpen] = useState(false);
    const [generatedNumber, setGeneratedNumber] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [now, setNow] = useState<Date>(new Date());
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (generatedNumber && category && priority) {
            window.print();
        }
    }, [generatedNumber, category, priority]);


    function handleRefresh() {
        if (refreshing || processing) return;
        setRefreshing(true);
        router.reload({
            only: ['transactionTypes'],
            onFinish: () => {
                setLastRefreshed(new Date());
                setRefreshing(false);
            },
        });
    }

    const toggleFullscreen = useCallback(async () => {
        if (!document.fullscreenElement) {
            try {
                await document.documentElement.requestFullscreen();
                setIsFullscreen(true);
            } catch { }
        } else {
            await document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, []);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key.toLowerCase() === 'f') {
                e.preventDefault();
                toggleFullscreen();
            } else if (e.key === 'Escape' && dialogOpen) {
                setDialogOpen(false);
            }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [dialogOpen, toggleFullscreen]);

    function handleDialogClose() {
        setDialogOpen(false);
    }

    // Use a single function to update both the transaction type and priority, then submit.
    const [clientType, setClientType] = useState('');

    async function handleGenerate(value: string) {
        if (processing) return;

        try {
            const { data } = await axios.post(route('queue.guard.generate'), {
                transaction_type_id: value,
                ispriority: clientType,
            });

            let num = data.generatedNumber.toString().replace(/[^0-9]/g, ''); // keep only digits
            num = num.padStart(4, '0'); // make sure it's 4 digits

            setGeneratedNumber(num);
            setDialogOpen(true);
            setTimeout(() => window.print(), 300);
        } catch (error) {
            console.error(error);
        }
    }


    return (
        <>
            <Head title="Generate Number" />
            <div className="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-slate-100 md:p-8">
                {/* Radial ambient glows (match main page) */}
                <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
                    <div className="absolute right-0 bottom-0 h-[28rem] w-[28rem] rounded-full bg-indigo-700/10 blur-3xl" />
                </div>
                <Card className="w-full max-w-3xl rounded-3xl border border-slate-800/70 bg-slate-900/70 shadow-2xl backdrop-blur-sm">
                    {/* NEW: utility bar */}
                    <div className="flex flex-wrap items-center justify-center gap-3 px-6 pt-5 text-xs font-medium text-slate-300 md:text-sm">
                        <div className="rounded-full bg-slate-800/60 px-4 py-1 font-mono">{now.toLocaleTimeString()}</div>
                        <div className="rounded-full bg-slate-800/60 px-4 py-1">Last refresh: {lastRefreshed.toLocaleTimeString()}</div>
                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={refreshing || processing}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-800/60 px-4 py-1 text-xs font-semibold tracking-wide text-slate-200 hover:bg-slate-800/80 disabled:opacity-50"
                        >
                            {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                    <CardHeader className="space-y-3 pb-4 text-center md:pb-6">
                        <CardTitle className="bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-3xl font-black tracking-[0.12em] text-transparent uppercase md:text-4xl xl:text-5xl">
                            Generate Your Queue Number
                        </CardTitle>
                        <p className="text-base font-medium text-slate-400 md:text-lg">Please select your transaction type</p>
                    </CardHeader>
                    <CardContent className="pb-10">
                        <form className="space-y-8">
                            <div className="flex justify-center gap-4 mb-6">
                                <Button
                                    type="button"
                                    variant={data.ispriority === 0 ? "default" : "outline"}
                                    onClick={() => setData('ispriority', 0)}
                                >
                                    Regular
                                </Button>
                                <Button
                                    type="button"
                                    variant={data.ispriority === 1 ? "default" : "outline"}
                                    onClick={() => setData('ispriority', 1)}
                                >
                                    Priority
                                </Button>
                            </div>
                            <div className="grid gap-5 sm:grid-cols-2">
                                {transactionTypes.map((opt: any) => {
                                    const selected = data.transaction_type_id === String(opt.id);
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => handleGenerate(String(opt.id))}
                                            disabled={processing}
                                            className={[
                                                'group relative flex flex-col items-center justify-center rounded-2xl p-6 text-slate-200 md:p-8',
                                                'border shadow-sm transition-all focus:outline-none focus-visible:ring-4',
                                                'border-slate-800/70 bg-slate-900/60 ring-offset-2 ring-offset-slate-950',
                                                'hover:border-slate-700/70 hover:bg-slate-900/70 hover:shadow-lg',
                                                selected ? 'border-amber-400/60 ring-4 ring-amber-400/40' : '',
                                                processing ? 'cursor-wait opacity-60' : '',
                                            ].join(' ')}
                                            aria-pressed={selected}
                                            aria-busy={processing && selected}
                                            aria-label={opt.name}
                                        >
                                            <div
                                                className={[
                                                    'mb-5 flex h-20 w-20 items-center justify-center rounded-2xl',
                                                    'bg-slate-800/70 shadow-inner',
                                                    'transition-transform duration-300',
                                                    selected ? 'scale-105' : 'group-hover:scale-105',
                                                ].join(' ')}
                                            >
                                                <span className="bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-4xl font-extrabold text-transparent drop-shadow">
                                                    {(opt.code || opt.name || '?').toString().charAt(0)}
                                                </span>
                                            </div>
                                            <span className="text-center text-lg leading-snug font-semibold md:text-xl">{opt.name}</span>
                                            {opt.description && (
                                                <span className="mt-1 line-clamp-2 text-center text-xs text-slate-400">{opt.description}</span>
                                            )}
                                            {selected && !processing && (
                                                <span className="absolute top-3 right-3 h-3 w-3 rounded-full bg-amber-400 ring-4 ring-amber-400/30" />
                                            )}
                                            {/* Subtle hover glow */}
                                            <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(250,204,21,0.08),transparent_65%)]" />
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(245,158,11,0.08),transparent_55%)]" />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.transaction_type_id && (
                                <div className="text-center text-lg font-medium text-rose-400">{errors.transaction_type_id}</div>
                            )}
                            <div className="flex items-center justify-between px-1 text-xs text-slate-500 md:text-sm">
                                <span className="tracking-wide">Tap a transaction to generate your number</span>
                                <button
                                    type="button"
                                    onClick={toggleFullscreen}
                                    className="inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800/80"
                                >
                                    {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                                    {isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
                    <DialogContent className="max-w-md rounded-3xl border border-slate-800/70 bg-slate-900/80 text-center shadow-xl backdrop-blur-md">
                        <DialogHeader>
                            <DialogTitle className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
                                Your Number
                            </DialogTitle>
                            <div className="mt-6 bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent drop-shadow md:text-7xl">
                                {generatedNumber}
                            </div>
                        </DialogHeader>

                        <div className="mt-8 space-y-4 print:hidden">
                            <Button
                                onClick={handleDialogClose}
                                className="h-16 w-full rounded-2xl bg-amber-500/90 text-lg font-semibold text-slate-900 hover:bg-amber-400"
                            >
                                OK
                            </Button>
                            <p className="text-xs text-slate-400">This ticket will auto-print. Present it to the teller.</p>
                        </div>
                    </DialogContent>

                    {/* Ticket layout for printing only */}
                    <div className="print-ticket hidden print:block text-center">
                        <div className="ticket-number text-5xl font-bold">{generatedNumber}</div>
                        <div className="ticket-category text-lg">{category}</div>
                        <div className="ticket-priority text-lg">{priority}</div>
                        <div className="ticket-footer text-sm mt-2">Please wait for your turn</div>
                    </div>
                </Dialog>


                <style>
                    {`
                        @media print {
  body * {
    visibility: hidden;
  }
  .print-ticket, .print-ticket * {
    visibility: visible;
  }
  .print-ticket {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    text-align: center;
    padding: 20px;
    font-family: Arial, sans-serif;
  }
  .ticket-number {
    font-size: 60px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  .ticket-category, .ticket-priority {
    font-size: 18px;
    margin-bottom: 5px;
  }
  .ticket-footer {
    font-size: 14px;
    color: #555;
    margin-top: 10px;
  }
}


                    `}
                </style>
            </div>
        </>
    );
}
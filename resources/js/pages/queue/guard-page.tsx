import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Head, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

export default function GuardPage({ transactionTypes = [] }: { transactionTypes?: any[] }) {
    // The useForm hook already handles the data. You don't need separate states for transactionTypeId and clientType.
    const { data, setData, post, processing, errors, reset } = useForm({
        transaction_type_id: '',
        ispriority: null,
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
        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (generatedNumber && category && priority) {
            window.print();
        }
    }, [generatedNumber, category, priority]);

    useEffect(() => {
        function handleAfterPrint() {
            // reset form only
            reset();
            handleRefresh();
        }

        window.addEventListener('afterprint', handleAfterPrint);
        return () => window.removeEventListener('afterprint', handleAfterPrint);
    }, []);

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
            } catch {}
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

    async function handleGenerate(value: string) {
        if (processing) return;

        try {
            const { data: response } = await axios.post(route('queue.guard.generate'), {
                transaction_type_id: value,
                ispriority: data.ispriority,
            });

            let num = response.generatedNumber.toString().replace(/[^0-9]/g, '');
            num = num.padStart(4, '0');

            setGeneratedNumber(num);

            // 👇 Set category from transactionTypes
            setCategory(transactionTypes.find((t) => String(t.id) === value)?.name || '');

            // 👇 Set readable priority
            setPriority(data.ispriority === 1 ? 'Priority' : 'Regular');

            setDialogOpen(true);
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
                    {/* Date & Time bar */}
                    <div className="flex items-center justify-center px-6 pt-5">
                        <div className="flex items-center gap-3 rounded-lg bg-slate-800/60 px-6 py-2 shadow-sm">
                            {/* Date */}
                            <span className="font-semibold text-slate-200">
                                {now.toLocaleDateString(undefined, {
                                    weekday: 'long',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </span>
                            {/* Time */}
                            <span className="font-mono text-lg text-slate-300">
                                {now.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                })}
                            </span>
                        </div>
                    </div>

                    <CardHeader className="space-y-3 pb-4 text-center md:pb-6">
                        <CardTitle className="bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-3xl font-black tracking-[0.12em] text-transparent uppercase md:text-4xl xl:text-5xl">
                            Generate Your Queue Number
                        </CardTitle>
                        <p className="text-base font-medium text-slate-400 md:text-lg">Please select your transaction type</p>
                    </CardHeader>
                    <CardContent className="pb-10">
                        <form className="space-y-8">
                            {/* Step 1: Choose Priority */}
                            <div className="mb-10 flex flex-col items-center gap-6">
                                <p className="text-lg font-semibold text-slate-200">Step 1: Choose Client Type</p>
                                <div className="flex gap-6">
                                    <Button
                                        type="button"
                                        size="lg"
                                        className={`h-20 w-40 rounded-2xl text-xl font-bold ${
                                            data.ispriority === 0
                                                ? 'bg-blue-500 text-white hover:bg-blue-400'
                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                        onClick={() => setData('ispriority', 0)}
                                    >
                                        Regular
                                    </Button>
                                    <Button
                                        type="button"
                                        size="lg"
                                        className={`h-20 w-40 rounded-2xl text-xl font-bold ${
                                            data.ispriority === 1
                                                ? 'bg-amber-400 text-slate-900 hover:bg-amber-300'
                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                        onClick={() => setData('ispriority', 1)}
                                    >
                                        Priority
                                    </Button>
                                </div>
                            </div>

                            {/* Step 2: Choose Transaction (only if priority chosen) */}
                            {data.ispriority === 0 || data.ispriority === 1 ? (
                                <>
                                    <p className="mb-4 text-center text-lg font-semibold text-slate-200">Step 2: Select Your Transaction</p>
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
                                                        <span className="mt-1 line-clamp-2 text-center text-xs text-slate-400">
                                                            {opt.description}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                <p className="mt-6 text-center text-slate-400 italic">Please select Regular or Priority first.</p>
                            )}
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
                    <div className="print-ticket hidden text-center print:block">
                        <div className="ticket-priority text-sm">{priority}</div>
                        <div className="ticket-number text-5xl font-bold">{generatedNumber}</div>
                        <div className="ticket-category text-lg">{category}</div>
                        <div className="ticket-footer text-xs text-slate-500">
                            {now.toLocaleDateString()}{' '}
                            {now.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </div>
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
                          padding: 5px;
                          font-family: Arial, sans-serif;
                          color: #000;
                        }
                        .ticket-number {
                          font-size: 60px;
                          font-weight: bold;
                          margin-bottom: 2px;
                        }
                        .ticket-category {
                          font-size: 15px;
                          margin-bottom: 2px;
                          font-weight: bold;
                        }
                         .ticket-priority {
                          font-size: 12px;
                          margin-bottom: 2px;
                          font-weight: bold;
                        }
                        .ticket-footer {
                          font-size: 8px;
                          color: #555;
                          margin-top: 2px;
                        }
                      }
                    `}
                </style>
            </div>
        </>
    );
}

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export default function GuardPage({ transactionTypes = [] }: { transactionTypes?: any[] }) {
    const { data, setData, post, processing, errors } = useForm({
        transaction_type: '',
    });

    const [dialogOpen, setDialogOpen] = useState(false);
    const [generatedNumber, setGeneratedNumber] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);

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

    function handleGenerate(value: string) {
        if (processing) return;
        setData('transaction_type', value);
        post(route('queue.guard.generate'), {
            onSuccess: (page: any) => {
                const number = page.props.generatedNumber || 'N/A';
                setGeneratedNumber(number);
                setDialogOpen(true);
                setTimeout(() => window.print(), 300);
            },
        });
    }

    return (
        <div className="kiosk-bg relative flex min-h-screen w-full items-center justify-center p-4 md:p-8">
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.18),transparent_60%),radial-gradient(circle_at_70%_80%,rgba(29,78,216,0.25),transparent_55%)]"
            />
            <Card className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/70 shadow-2xl backdrop-blur-xl transition-all dark:bg-slate-900/70">
                <CardHeader className="space-y-3 pb-4 text-center md:pb-6">
                    <CardTitle className="bg-gradient-to-br from-blue-700 via-indigo-600 to-blue-800 bg-clip-text text-3xl font-black tracking-tight text-transparent md:text-4xl xl:text-5xl">
                        Generate Your Queue Number
                    </CardTitle>
                    <p className="flex items-center justify-center gap-2 text-base text-slate-600 md:text-lg dark:text-slate-300">
                        Please select your transaction type
                    </p>
                </CardHeader>
                <CardContent className="pb-10">
                    <form className="space-y-8">
                        <div className="grid gap-5 sm:grid-cols-2">
                            {transactionTypes.map((opt) => {
                                const selected = data.transaction_type === opt.name;
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => handleGenerate(opt.name)}
                                        disabled={processing}
                                        className={[
                                            'group relative flex flex-col items-center justify-center rounded-2xl p-6 md:p-8',
                                            'border shadow-sm transition-all focus:outline-none focus-visible:ring-4',
                                            'border-slate-300/60 dark:border-slate-600/40',
                                            'bg-gradient-to-br from-blue-500/10 to-sky-500/10 hover:from-blue-500/20 hover:to-sky-500/20',
                                            selected
                                                ? 'border-blue-400/60 ring-4 ring-blue-400/60 ring-offset-2 ring-offset-white dark:border-blue-500/60 dark:ring-blue-500/50 dark:ring-offset-slate-900'
                                                : 'hover:shadow-md',
                                            processing ? 'cursor-wait opacity-70' : '',
                                        ].join(' ')}
                                        aria-pressed={selected}
                                        aria-busy={processing && selected}
                                        aria-label={opt.name}
                                    >
                                        <div
                                            className={[
                                                'mb-5 flex h-20 w-20 items-center justify-center rounded-2xl text-4xl',
                                                'bg-white/70 shadow-inner dark:bg-slate-800/70',
                                                selected ? 'scale-105' : 'group-hover:scale-105',
                                                'transition-transform',
                                            ].join(' ')}
                                        >
                                            <span className="text-4xl font-bold text-blue-600">{opt.name[0]}</span>
                                        </div>
                                        <span className="text-center text-lg leading-snug font-semibold text-slate-800 md:text-xl dark:text-slate-100">
                                            {opt.name}
                                        </span>
                                        <span className="text-xs text-slate-500">{opt.description}</span>
                                        {selected && !processing && (
                                            <span className="absolute top-3 right-3 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-blue-500/30" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {errors.transaction_type && (
                            <div className="text-center text-lg font-medium text-red-600 dark:text-red-400">{errors.transaction_type}</div>
                        )}

                        <div className="flex items-center justify-between px-1 text-xs text-slate-500 md:text-sm dark:text-slate-400">
                            <span>Tap a transaction to generate your number</span>
                            <button
                                type="button"
                                onClick={toggleFullscreen}
                                className="inline-flex items-center gap-1 rounded-full border border-slate-300/50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white/50 dark:border-slate-600/50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                            >
                                {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                                {isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
                <DialogContent className="max-w-md rounded-3xl border border-slate-200/80 text-center dark:border-slate-600/60 print:!bg-white print:!p-0 print:!shadow-none">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-emerald-700 md:text-3xl dark:text-emerald-300 print:!text-black">
                            Your Number
                        </DialogTitle>
                        <DialogDescription asChild>
                            <div className="mt-6 bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent md:text-7xl dark:from-white dark:to-slate-200 print:!text-black">
                                {generatedNumber}
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-8 space-y-4 print:hidden">
                        <Button onClick={handleDialogClose} className="h-16 w-full rounded-2xl bg-blue-600 text-xl font-semibold hover:bg-blue-700">
                            OK
                        </Button>
                        <p className="text-xs text-slate-500">This ticket will auto-print. Present it to the teller.</p>
                    </div>
                </DialogContent>
            </Dialog>

            <style>
                {`
                @media print {
                    body, html { background: #fff !important; }
                    .kiosk-bg, .kiosk-bg *:not(.print\\:block) { background: #fff !important; }
                }
                `}
            </style>
        </div>
    );
}

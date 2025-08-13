import { Badge } from '@/components/ui/badge'; // ensure Badge exists in shadcn setup
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, Hand, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function TellerPage({ current }: { current?: any }) {
    const { post, processing } = useForm();

    function handleGrab() {
        if (processing) return;
        post(route('queue.teller.grab'));
    }

    function handleNext() {
        if (processing) return;
        post(route('queue.teller.next'));
    }

    // Keyboard shortcuts
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (processing) return;
            const k = e.key.toLowerCase();
            if (!current && (k === 'g' || k === ' ')) {
                e.preventDefault();
                handleGrab();
            } else if (current && (k === 'n' || k === ' ')) {
                e.preventDefault();
                handleNext();
            }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [current, processing]);

    const breadcrumbs = [{ title: 'Teller', href: '/queue/teller' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Teller" />
            <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-10">
                <Card className="w-full max-w-xl border-slate-700/60 bg-slate-900/70 shadow-2xl backdrop-blur-sm">
                    <CardHeader className="border-b border-slate-700/50 pb-4">
                        <CardTitle className="flex items-center justify-between text-slate-100">
                            <span className="text-lg font-semibold tracking-wide">Teller Panel</span>
                            <span className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">{current ? 'Active' : 'Idle'}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {current ? (
                            <div className="flex animate-[fadeIn_0.4s_ease] flex-col items-center gap-6">
                                <div className="flex flex-col items-center gap-3">
                                    <Badge
                                        variant="outline"
                                        className="border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs tracking-wide text-emerald-300"
                                    >
                                        Now Serving
                                    </Badge>
                                    <div className="bg-gradient-to-br from-cyan-300 via-emerald-300 to-teal-200 bg-clip-text text-7xl font-black tracking-tight text-transparent tabular-nums drop-shadow md:text-8xl">
                                        {current.number}
                                    </div>
                                    <Badge className="border border-slate-600 bg-slate-700/70 px-3 py-1 text-sm font-medium hover:bg-slate-700">
                                        {current.transaction_type}
                                    </Badge>
                                </div>

                                <div className="flex w-full flex-col gap-3">
                                    <Button onClick={handleNext} disabled={processing} size="lg" className="group w-full gap-2 font-semibold">
                                        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                                        <span>Next Number</span>
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                    <p className="text-center text-xs text-slate-400">Shortcuts: N / Space = Next</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex animate-[fadeIn_0.4s_ease] flex-col items-center gap-8">
                                <div className="space-y-3 text-center">
                                    <div className="text-sm tracking-wider text-slate-400 uppercase">No Active Ticket</div>
                                    <p className="max-w-sm text-sm text-slate-300">
                                        Grab the next waiting number to start serving. Use keyboard shortcuts to work faster.
                                    </p>
                                </div>
                                <Button onClick={handleGrab} disabled={processing} size="lg" className="w-full gap-2 font-semibold">
                                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Hand className="h-4 w-4" />}
                                    {processing ? 'Processing...' : 'Grab Next Number'}
                                </Button>
                                <p className="text-center text-xs text-slate-400">Shortcuts: G / Space = Grab</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

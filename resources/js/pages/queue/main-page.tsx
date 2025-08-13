import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

type ServingTicket = {
    id: number;
    number: string | number;
    transaction_type?: string;
    status?: 'waiting' | 'serving' | string;
    served_by?: string | number; // added (maps to teller / counter)
    teller?: string | number;
    counter?: string | number;
    updated_at?: string;
    created_at?: string;
};

interface Props {
    serving: ServingTicket[]; // initial (SSR) list
}

export default function MainPage({ serving }: Props) {
    const [servingTickets, setServingTickets] = useState<ServingTicket[]>(serving || []);
    const [waitingTickets, setWaitingTickets] = useState<ServingTicket[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [now, setNow] = useState<Date>(new Date());
    const intervalRef = useRef<number | null>(null);

    // Clock
    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(id);
    }, []);

    // Updated fetch that tries multiple endpoints until one succeeds
    async function fetchBoard() {
        try {
            setLoading(true);
            let url: string;
            try {
                // @ts-ignore
                url = route('queue.board.data');
            } catch {
                url = '/queue/board';
            }
            const res = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });
            if (!res.ok) throw new Error('Board fetch failed');
            const json = await res.json();

            const serving = (json.serving || []).map((t: any) => ({
                id: t.id,
                number: t.number,
                transaction_type: t.transaction_type,
                status: t.status,
                served_by: t.served_by,
                teller: t.served_by,
                counter: t.served_by,
                updated_at: t.updated_at,
                created_at: t.created_at,
            }));

            const waiting = (json.waiting || []).map((t: any) => ({
                id: t.id,
                number: t.number,
                transaction_type: t.transaction_type,
                status: t.status,
                served_by: t.served_by,
                teller: t.served_by,
                counter: t.served_by,
                updated_at: t.updated_at,
                created_at: t.created_at,
            }));

            setServingTickets(serving);
            setWaitingTickets(waiting);
            setLastUpdated(json.generated_at ? new Date(json.generated_at) : new Date());
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('[queue-board] fetch error', e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchBoard();
        intervalRef.current = window.setInterval(fetchBoard, 5000) as unknown as number;
        return () => {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
        };
    }, []);

    const skeletonCards = Array.from({ length: 4 });

    return (
        <>
            <Head title="Now Serving" />
            <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
                {/* Decorative radial glows */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
                    <div className="absolute right-0 bottom-0 h-[28rem] w-[28rem] rounded-full bg-indigo-700/10 blur-3xl" />
                </div>

                {/* Header */}
                <header className="relative z-10 w-full border-b border-slate-800/70 bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-slate-900/55">
                    <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 py-6 text-center md:py-8">
                        <h1 className="bg-gradient-to-br from-yellow-300 via-amber-200 to-yellow-400 bg-clip-text text-4xl font-extrabold tracking-[0.2em] text-transparent uppercase drop-shadow md:text-6xl xl:text-7xl">
                            Now Serving
                        </h1>
                        <p className="text-sm font-medium tracking-wide text-slate-300 md:text-base">
                            Please proceed to the indicated counter when your number appears
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs md:text-sm">
                            <div className="rounded-full bg-slate-800/60 px-4 py-1 font-mono text-slate-300">{now.toLocaleTimeString()}</div>
                            <div className="rounded-full bg-slate-800/60 px-4 py-1 text-slate-400">
                                {lastUpdated ? `Last update: ${lastUpdated.toLocaleTimeString()}` : 'Initializing...'}
                            </div>
                            <div
                                className={[
                                    'flex items-center gap-1 rounded-full px-4 py-1',
                                    loading ? 'bg-amber-500/10 text-amber-300' : 'bg-emerald-500/10 text-emerald-300',
                                ].join(' ')}
                            >
                                <span className={['h-2 w-2 rounded-full', loading ? 'animate-pulse bg-amber-400' : 'bg-emerald-400'].join(' ')} />
                                {loading ? 'Refreshing…' : 'Live'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="relative z-10 mx-auto flex w-full flex-1 flex-col px-4 pt-6 pb-12 md:px-8 md:pt-10">
                    <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-2">
                        {/* Waiting Column */}
                        <section className="flex flex-col gap-5">
                            <header className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold tracking-wide text-slate-200 md:text-2xl">
                                    <span className="bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">Please Wait</span>
                                </h2>
                                <div className="rounded-full bg-slate-800/60 px-3 py-1 text-xs font-medium text-slate-400">
                                    {waitingTickets.length} queued
                                </div>
                            </header>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                {loading &&
                                    waitingTickets.length === 0 &&
                                    skeletonCards.map((_, i) => (
                                        <div
                                            key={`w-skel-${i}`}
                                            className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5"
                                        >
                                            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-800/40 via-slate-800/10 to-slate-900/40" />
                                            <div className="relative mb-6 h-8 w-24 rounded bg-slate-700/40" />
                                            <div className="relative h-10 w-32 rounded bg-slate-700/40" />
                                        </div>
                                    ))}

                                {!loading && waitingTickets.length === 0 && (
                                    <div className="col-span-full rounded-2xl border border-slate-800/60 bg-slate-900/50 p-10 text-center">
                                        <p className="text-sm font-medium tracking-wide text-slate-400">No waiting tickets</p>
                                    </div>
                                )}

                                {waitingTickets.map((t) => (
                                    <div
                                        key={`waiting-${t.id}`}
                                        className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/60 p-6 shadow ring-1 ring-slate-800/40 transition hover:shadow-lg hover:ring-slate-700/60"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="rounded-full bg-slate-700/40 px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-300 uppercase">
                                                Waiting
                                            </span>
                                            {t.transaction_type && (
                                                <span className="truncate rounded-full bg-slate-800/70 px-3 py-1 text-[10px] font-medium tracking-wide text-slate-400">
                                                    {t.transaction_type}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <div className="bg-gradient-to-br from-slate-200 via-slate-300 to-white bg-clip-text text-5xl font-black tracking-tight text-transparent tabular-nums drop-shadow-sm">
                                                {t.number}
                                            </div>
                                            {(t.teller || t.counter) && (
                                                <div className="self-start rounded-lg border border-slate-700/60 bg-slate-800/60 px-2 py-1 text-[10px] font-medium tracking-wide text-slate-300">
                                                    Cntr {t.teller ?? t.counter}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Serving Column */}
                        <section className="flex flex-col gap-5">
                            <header className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold tracking-wide text-slate-200 md:text-2xl">
                                    <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                                        Now Serving
                                    </span>
                                </h2>
                                <div className="rounded-full bg-slate-800/60 px-3 py-1 text-xs font-medium text-slate-400">
                                    {servingTickets.length} active
                                </div>
                            </header>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {loading &&
                                    servingTickets.length === 0 &&
                                    skeletonCards.map((_, i) => (
                                        <div
                                            key={`s-skel-${i}`}
                                            className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6"
                                        >
                                            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-800/40 via-slate-800/10 to-slate-900/40" />
                                            <div className="relative mb-8 h-10 w-36 rounded bg-slate-700/40" />
                                            <div className="relative h-24 w-44 rounded bg-slate-700/40" />
                                        </div>
                                    ))}

                                {!loading && servingTickets.length === 0 && (
                                    <div className="col-span-full rounded-2xl border border-slate-800/60 bg-slate-900/50 p-10 text-center">
                                        <p className="text-sm font-medium tracking-wide text-slate-400">No tickets are being served</p>
                                    </div>
                                )}

                                {servingTickets.map((t) => {
                                    const counter = t.teller ?? t.counter ?? '—';
                                    return (
                                        <div
                                            key={`serving-${t.id}`}
                                            className="group relative overflow-hidden rounded-3xl border border-slate-800/70 bg-gradient-to-br from-slate-900/70 via-slate-900/60 to-slate-950/70 p-6 shadow-xl ring-1 ring-slate-800/50 transition hover:shadow-2xl hover:ring-slate-700/70"
                                        >
                                            <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(250,204,21,0.10),transparent_65%)]" />
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(245,158,11,0.10),transparent_55%)]" />
                                            </div>
                                            <div className="relative mb-5 flex items-center justify-between">
                                                <span className="rounded-full bg-rose-500/15 px-4 py-1 text-[10px] font-semibold tracking-wider text-rose-300 uppercase">
                                                    Serving
                                                </span>
                                                <span className="rounded-full bg-indigo-500/15 px-4 py-1 text-[10px] font-semibold tracking-wider text-indigo-300 uppercase">
                                                    Counter {counter}
                                                </span>
                                            </div>
                                            <div className="relative flex flex-col items-center gap-4">
                                                <div className="bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-7xl font-black tracking-tight text-transparent tabular-nums drop-shadow-sm md:text-8xl">
                                                    {t.number}
                                                </div>
                                                {t.transaction_type && (
                                                    <div className="rounded-xl border border-slate-700/60 bg-slate-800/70 px-4 py-2 text-center text-sm font-medium tracking-wide text-slate-200 shadow-sm">
                                                        {t.transaction_type}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                </main>

                {/* Footer */}
                <footer className="relative z-10 mt-auto w-full border-t border-slate-800/70 bg-slate-900/70 py-4 text-center text-xs font-medium tracking-wide text-slate-400 backdrop-blur">
                    DSWD Queuing System • Real-time Serving Board
                </footer>
            </div>
        </>
    );
}

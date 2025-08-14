import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

// Define a single type for the QueueTicket since both lists have the same structure.
type QueueTicket = {
    id: number;
    number: string | number;
    transaction_type_id?: string;
    status?: 'waiting' | 'serving' | string;
    served_by?: string | number;
    teller_number?: string;
    updated_at?: string;
    created_at?: string;
};

// Define the structure of the data returned by the API.
interface BoardData {
    serving: QueueTicket[];
    waiting: QueueTicket[];
    generated_at: string;
}

// Update the props to match the data structure from your Laravel controller.
interface Props {
    // The initial data will be from the Inertia page props,
    // which should match the structure of your JSON endpoint.
    boardData: BoardData;
}

export default function MainPage({ boardData }: Props) {
    const [servingTickets, setServingTickets] = useState<QueueTicket[]>(boardData.serving || []);
    const [waitingTickets, setWaitingTickets] = useState<QueueTicket[]>(boardData.waiting || []);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(boardData.generated_at ? new Date(boardData.generated_at) : null);
    const [now, setNow] = useState<Date>(new Date());
    const intervalRef = useRef<number | null>(null);
    const [redirectError, setRedirectError] = useState<string | null>(null);
    const BOARD_ENDPOINT = '/queue/board-data';

    // Clock
    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(id);
    }, []);

    // Fetching logic is now consolidated and slightly simplified.
    const fetchBoard = async () => {
        try {
            setLoading(true);
            let url: string;
            // The Ziggy route is a good practice, but the fallback is already there.
            // Let's make it a bit cleaner.
            try {
                // @ts-ignore Ziggy route (if registered)
                url = route('queue.board.data');
            } catch {
                url = BOARD_ENDPOINT;
            }

            const res = await fetch(url, {
                headers: { Accept: 'application/json' },
                cache: 'no-store',
            });

            const contentType = res.headers.get('content-type') || '';

            if (res.redirected || (!contentType.includes('application/json') && !res.ok)) {
                setRedirectError(`The endpoint is redirecting or not returning JSON. Ensure GET ${BOARD_ENDPOINT} is public.`);
                return;
            }

            if (!res.ok) {
                throw new Error('Failed to fetch queue board data.');
            }

            const json: BoardData = await res.json();

            // Map the data to your component state. No need for the extra mapping logic,
            // as the Laravel controller already returns the correct keys.
            setServingTickets(json.serving || []);
            setWaitingTickets(json.waiting || []);
            setLastUpdated(json.generated_at ? new Date(json.generated_at) : new Date());
        } catch (e) {
            console.error('[queue-board] fetch error', e);
        } finally {
            setLoading(false);
        }
    };

    // This effect now handles the initial fetch and sets up the polling interval.
    useEffect(() => {
        fetchBoard();
        const id = window.setInterval(fetchBoard, 5000);
        intervalRef.current = id;
        return () => {
            if (intervalRef.current !== null) {
                window.clearInterval(intervalRef.current);
            }
        };
    }, []); // remove redirectError from deps

    const skeletonCards = Array.from({ length: 4 });

    return (
        <>
            <Head title="Now Serving" />
            <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-white via-slate-50 to-white text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
                {/* Decorative radial glows (DSWD colors, light/dark) */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl dark:bg-blue-600/20" />
                    <div className="absolute right-0 bottom-0 h-[28rem] w-[28rem] rounded-full bg-red-500/10 blur-3xl dark:bg-red-600/15" />
                </div>

                {/* Header */}
                <header className="relative z-10 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/65 dark:border-slate-800/70 dark:bg-slate-900/70">
                    <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 py-6 text-center md:py-8">
                        <h1 className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-4xl font-extrabold tracking-[0.2em] text-transparent uppercase drop-shadow-sm md:text-6xl xl:text-7xl dark:from-amber-500 dark:via-yellow-400 dark:to-amber-500">
                            Now Serving
                        </h1>
                        <p className="text-sm font-medium tracking-wide text-slate-600 md:text-base dark:text-slate-300">
                            Please proceed to the indicated teller when your number appears
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs md:text-sm">
                            <div className="rounded-full bg-slate-200/70 px-4 py-1 font-mono text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                                {now.toLocaleTimeString()}
                            </div>
                            <div className="rounded-full bg-slate-200/70 px-4 py-1 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                                {lastUpdated ? `Last update: ${lastUpdated.toLocaleTimeString()}` : 'Initializing...'}
                            </div>
                            <div
                                className={[
                                    'flex items-center gap-1 rounded-full px-4 py-1',
                                    loading
                                        ? 'bg-yellow-200/70 text-yellow-800 dark:bg-amber-500/10 dark:text-amber-300'
                                        : 'bg-emerald-200/70 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300',
                                ].join(' ')}
                            >
                                <span
                                    className={[
                                        'h-2 w-2 rounded-full',
                                        loading ? 'animate-pulse bg-yellow-500 dark:bg-amber-400' : 'bg-emerald-600 dark:bg-emerald-400',
                                    ].join(' ')}
                                />
                                {loading ? 'Refreshing…' : 'Live'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="relative z-10 mx-auto flex w-full flex-1 flex-col px-4 pt-6 pb-12 md:px-8 md:pt-10">
                    {redirectError && (
                        <div className="mx-auto mb-6 w-full max-w-7xl rounded-lg border border-yellow-500/30 bg-yellow-100/60 px-5 py-4 text-sm text-yellow-900 dark:border-amber-600/40 dark:bg-amber-900/30 dark:text-amber-200">
                            <strong className="font-semibold">Data Load Warning:</strong> {redirectError}
                            <div className="mt-2 text-xs opacity-80">
                                Fix: In routes/web.php, make sure the following route is NOT inside any auth middleware:
                                <pre className="mt-1 rounded bg-yellow-50 p-2 font-mono text-[11px] whitespace-pre-wrap text-slate-800 dark:bg-amber-950/40 dark:text-amber-200">
                                    {`Route::get('/queue/board-data',[QueueBoardController::class,'data'])->name('queue.board.data');`}
                                </pre>
                            </div>
                        </div>
                    )}

                    <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-2">
                        {/* Serving Column */}
                        <section className="flex flex-col gap-5">
                            <header className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold tracking-wide text-slate-800 md:text-2xl dark:text-slate-200">
                                    <span className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-transparent dark:from-amber-500 dark:via-yellow-400 dark:to-amber-500">
                                        Now Serving
                                    </span>
                                </h2>
                                <div className="rounded-full bg-slate-200/70 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                                    {servingTickets.length} active
                                </div>
                            </header>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {loading &&
                                    servingTickets.length === 0 &&
                                    skeletonCards.map((_, i) => (
                                        <div
                                            key={`s-skel-${i}`}
                                            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40"
                                        >
                                            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-800/40 dark:via-slate-800/10 dark:to-slate-900/40" />
                                            <div className="relative mb-8 h-10 w-36 rounded bg-slate-200 dark:bg-slate-700/40" />
                                            <div className="relative h-24 w-44 rounded bg-slate-200 dark:bg-slate-700/40" />
                                        </div>
                                    ))}

                                {!loading && servingTickets.length === 0 && (
                                    <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-400">
                                        No tickets are being served
                                    </div>
                                )}

                                {servingTickets.map((t) => {
                                    const teller = t.teller_number ?? '—';
                                    return (
                                        <div
                                            key={`serving-${t.id}`}
                                            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl ring-1 ring-slate-200/60 transition hover:shadow-2xl hover:ring-slate-300/70 dark:border-slate-800/70 dark:bg-gradient-to-br dark:from-slate-900/70 dark:via-slate-900/60 dark:to-slate-950/70 dark:ring-slate-800/50 dark:hover:ring-slate-700/70"
                                        >
                                            {/* Brand hover glows */}
                                            <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.10),transparent_65%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.10),transparent_65%)]" />
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(239,68,68,0.10),transparent_55%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(239,68,68,0.10),transparent_55%)]" />
                                            </div>
                                            <div className="relative mb-5 flex items-center justify-between">
                                                <span className="rounded-full bg-red-100 px-4 py-1 text-[10px] font-semibold tracking-wider text-red-700 uppercase dark:bg-rose-500/15 dark:text-rose-300">
                                                    Serving
                                                </span>
                                                <span className="rounded-full bg-blue-100 px-4 py-1 text-[10px] font-semibold tracking-wider text-blue-700 uppercase dark:bg-indigo-500/15 dark:text-indigo-300">
                                                    Teller {teller}
                                                </span>
                                            </div>
                                            <div className="relative flex flex-col items-center gap-4">
                                                <div className="bg-gradient-to-br from-yellow-500 via-amber-400 to-yellow-600 bg-clip-text text-7xl font-black tracking-tight text-transparent tabular-nums drop-shadow-sm md:text-8xl dark:from-amber-300 dark:via-yellow-200 dark:to-amber-400">
                                                    {t.number}
                                                </div>
                                                {t.transaction_type && (
                                                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-medium tracking-wide text-slate-700 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-200">
                                                        {t.transaction_type?.name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Waiting Column */}
                        <section className="flex flex-col gap-5">
                            <header className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold tracking-wide text-slate-800 md:text-2xl dark:text-slate-200">
                                    <span className="bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent dark:from-slate-200 dark:to-slate-400">
                                        Please Wait
                                    </span>
                                </h2>
                                <div className="rounded-full bg-slate-200/70 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                                    {waitingTickets.length} queued
                                </div>
                            </header>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                {loading &&
                                    waitingTickets.length === 0 &&
                                    skeletonCards.map((_, i) => (
                                        <div
                                            key={`w-skel-${i}`}
                                            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40"
                                        >
                                            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-800/40 dark:via-slate-800/10 dark:to-slate-900/40" />
                                            <div className="relative mb-6 h-8 w-24 rounded bg-slate-200 dark:bg-slate-700/40" />
                                            <div className="relative h-10 w-32 rounded bg-slate-200 dark:bg-slate-700/40" />
                                        </div>
                                    ))}

                                {!loading && waitingTickets.length === 0 && (
                                    <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-400">
                                        No waiting tickets
                                    </div>
                                )}

                                {waitingTickets.map((t) => (
                                    <div
                                        key={`waiting-${t.id}`}
                                        className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-200/50 transition hover:shadow-md hover:ring-slate-300/70 dark:border-slate-800/70 dark:bg-slate-900/60 dark:ring-slate-800/40 dark:hover:ring-slate-700/60"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-600 uppercase dark:bg-slate-700/40 dark:text-slate-300">
                                                Waiting
                                            </span>
                                            {t.transaction_type_id && (
                                                <span className="truncate rounded-full bg-slate-100 px-3 py-1 text-[10px] font-medium tracking-wide text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
                                                    {t.transaction_type?.name}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 bg-clip-text text-5xl font-black tracking-tight text-transparent drop-shadow-sm dark:from-slate-200 dark:via-slate-300 dark:to-white">
                                                {t.number}
                                            </div>
                                            {t.teller && (
                                                <div className="self-start rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] font-medium tracking-wide text-slate-600 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300">
                                                    Cntr {t.teller}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </main>

                {/* Footer */}
                <footer className="relative z-10 mt-auto w-full border-t border-slate-200/70 bg-white/80 py-4 text-center text-xs font-medium tracking-wide text-slate-600 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-400">
                    DSWD Queuing System • Real-time Serving Board
                </footer>
            </div>
        </>
    );
}

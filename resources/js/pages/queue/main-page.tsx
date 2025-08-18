import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

// Define a single type for the QueueTicket since both lists have the same structure.
type QueueTicket = {
    id: number;
    number: string | number;
    transaction_type_id?: string;
    transaction_type?: { name: string } | null;
    status?: 'waiting' | 'serving' | string;
    served_by?: string | number;
    teller_id?: string;
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
    boardData: BoardData;
    transactionTypes?: Array<{ id: number; name: string; description?: string; [key: string]: any }>;
}

// Lightweight, themed video slot used in the header corners.
// Build a local playlist from resources/videos and auto-play/auto-next.
function VideoSlot({ emptyText = 'No video configured' }: { emptyText?: string }) {
    // Collect local videos from resources/videos (including subfolders). Supported: mp4, webm, ogg
    const modules = import.meta.glob('/resources/videos/**/*.{mp4,webm,ogg}', { eager: true, as: 'url' }) as Record<string, string>;
    const sources = useMemo(() => {
        // Sort by path so playback is predictable
        return Object.entries(modules)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([, url]) => url);
    }, []);
    const [index, setIndex] = useState(0);
    const hasVideos = sources.length > 0;
    const src = hasVideos ? sources[index % sources.length] : null;

    return (
        <div className="h-[37.5vh] w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 shadow-xl ring-1 ring-slate-200/60 backdrop-blur md:h-[37.5vh] lg:h-[42.5vh] xl:h-[47.5vh] dark:border-slate-800/70 dark:bg-slate-900/70 dark:ring-slate-800/50">
            <div className="h-full w-full">
                {src ? (
                    <video
                        key={src}
                        className="h-full w-full object-cover"
                        src={src}
                        autoPlay
                        muted
                        controls
                        playsInline
                        onEnded={() => setIndex((i) => (i + 1) % sources.length)}
                        onError={() => setIndex((i) => (i + 1) % sources.length)}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
                        {emptyText} <br /> Place videos in resources/videos
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MainPage({ boardData, transactionTypes = [] }: Props) {
    const [servingTickets, setServingTickets] = useState<QueueTicket[]>(boardData.serving || []);
    const [waitingTickets, setWaitingTickets] = useState<QueueTicket[]>(boardData.waiting || []);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(boardData.generated_at ? new Date(boardData.generated_at) : null);
    const [now, setNow] = useState<Date>(new Date());
    const intervalRef = useRef<number | null>(null);
    const [redirectError, setRedirectError] = useState<string | null>(null);
    const BOARD_ENDPOINT = '/queue/board-data';

    // Fit-to-screen: compute how many cards can be shown in each area.
    const servingWrapRef = useRef<HTMLDivElement | null>(null);
    const waitingWrapRef = useRef<HTMLDivElement | null>(null);
    const [servingCapacity, setServingCapacity] = useState(4);
    const [waitingCapacity, setWaitingCapacity] = useState(4);

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

    // ResizeObserver to keep content within viewport (no scroll/overlap)
    useEffect(() => {
        const ro = new ResizeObserver(() => {
            // Serving area (always 2 columns on the right)
            if (servingWrapRef.current) {
                const h = servingWrapRef.current.clientHeight;
                const rowH = 200 + 20; // slightly tighter to fit more rows
                const rows = Math.max(1, Math.floor((h + 20) / rowH));
                setServingCapacity(rows * 2);
            }
            // Waiting area (left bottom)
            if (waitingWrapRef.current) {
                const el = waitingWrapRef.current;
                const h = el.clientHeight;
                const w = el.clientWidth;
                // Heuristic columns by width: small→1, sm→2, md→3, lg→5
                const cols = w >= 1280 ? 5 : w >= 1024 ? 4 : w >= 768 ? 3 : w >= 640 ? 2 : 1;
                const rowH = 64 + 12; // compact waiting card height + gap
                const rows = Math.max(1, Math.floor((h + 12) / rowH));
                const capacity = rows * cols;
                // Ensure we show at least 5 waiting cards when available
                setWaitingCapacity(Math.max(5, capacity));
            }
        });
        if (servingWrapRef.current) ro.observe(servingWrapRef.current);
        if (waitingWrapRef.current) ro.observe(waitingWrapRef.current);
        // Also observe body to react to viewport changes
        ro.observe(document.body);
        return () => ro.disconnect();
    }, []);

    // Group serving tickets by transaction type (right side; 2 columns)
    function groupByType(list: QueueTicket[]): Array<[string, QueueTicket[]]> {
        const map = new Map<string, QueueTicket[]>();
        for (const t of list) {
            // @ts-ignore API may attach transaction_type object
            const key = t.transaction_type?.name || 'Other';
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(t);
        }
        return Array.from(map.entries());
    }

    // Slice grouped items to fit a total capacity (keeps order, fills groups top-down)
    function sliceGroups(groups: Array<[string, QueueTicket[]]>, total: number): Array<[string, QueueTicket[]]> {
        let remain = total;
        const out: Array<[string, QueueTicket[]]> = [];
        for (const [label, items] of groups) {
            if (remain <= 0) break;
            const take = Math.min(items.length, remain);
            out.push([label, items.slice(0, take)]);
            remain -= take;
        }
        return out;
    }

    // Apply capacities
    const groupedServing = groupByType(servingTickets);
    const groupedServingLimited = sliceGroups(groupedServing, servingCapacity);
    const waitingLimited = waitingTickets.slice(0, waitingCapacity);
    // Decide left/right columns dynamically from transactionTypes metadata (if any)
    // Supported metadata fields: column, side, position, display_column (flexible)
    const txnTypes = transactionTypes || [];
    let leftNames: string[] = [];
    let rightNames: string[] = [];

    for (const t of txnTypes) {
        const meta = t.column ?? t.side ?? t.position ?? t.display_column ?? t.side_of_screen ?? null;
        if (meta !== null && meta !== undefined) {
            const s = String(meta).toLowerCase();
            if (s.includes('left') || s === 'l' || s === '1' || s === 'a') leftNames.push(t.name);
            else if (s.includes('right') || s === 'r' || s === '2' || s === 'b') rightNames.push(t.name);
        }
    }

    // If no explicit columns found, fall back to first two transaction types (if available)
    if (leftNames.length === 0 && rightNames.length === 0) {
        if (txnTypes.length >= 2) {
            leftNames = [txnTypes[0].name];
            rightNames = [txnTypes[1].name];
        } else if (txnTypes.length === 1) {
            leftNames = [txnTypes[0].name];
            rightNames = [];
        } else {
            // final fallback to previous labels for compatibility
            leftNames = ['Guarantee Letter'];
            rightNames = ['Cash Assistance'];
        }
    }

    const leftLabel = leftNames[0] ?? 'Left';
    const rightLabel = rightNames[0] ?? 'Right';
    const servingRows = Math.max(1, Math.floor(servingCapacity / 2));

    // Filter serving tickets by whether their transaction_type matches left/right names
    const guaranteeAll = servingTickets.filter((t) => leftNames.includes(t.transaction_type?.name));
    const cashAll = servingTickets.filter((t) => rightNames.includes(t.transaction_type?.name));
    const guaranteeLimited = guaranteeAll.slice(0, servingRows);
    const cashLimited = cashAll.slice(0, servingRows);

    const skeletonCards = Array.from({ length: 4 });

    return (
        <>
            <Head title="Now Serving" />
            <div className="relative flex h-screen min-h-screen flex-col overflow-hidden bg-gradient-to-br from-white via-slate-50 to-white text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
                {/* Decorative radial glows (DSWD colors, light/dark) */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl dark:bg-blue-600/20" />
                    <div className="absolute right-0 bottom-0 h-[28rem] w-[28rem] rounded-full bg-red-500/10 blur-3xl dark:bg-red-600/15" />
                </div>

                {/* Header (compact toolbar) */}
                <header className="relative z-10 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/65 dark:border-slate-800/70 dark:bg-slate-900/70">
                    <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-2 md:justify-between md:px-6">
                        <div className="flex flex-wrap items-center justify-center gap-4 text-xs md:text-sm">
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
                <main className="relative z-10 mx-auto flex min-h-0 w-full flex-1 flex-col overflow-hidden px-4 pt-3 pb-3 md:px-8 md:pt-5 md:pb-5">
                    {redirectError && (
                        <div className="mx-auto mb-4 w-full max-w-7xl rounded-lg border border-yellow-500/30 bg-yellow-100/60 px-5 py-3 text-sm text-yellow-900 dark:border-amber-600/40 dark:bg-amber-900/30 dark:text-amber-200">
                            <strong className="font-semibold">Data Load Warning:</strong> {redirectError}
                            <div className="mt-2 text-xs opacity-80">
                                Fix: In routes/web.php, make sure the following route is NOT inside any auth middleware:
                                <pre className="mt-1 rounded bg-yellow-50 p-2 font-mono text-[11px] whitespace-pre-wrap text-slate-800 dark:bg-amber-950/40 dark:text-amber-200">
                                    {`Route::get('/queue/board-data',[QueueBoardController::class,'data'])->name('queue.board.data');`}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Left = Video (top) + Waiting (bottom); Right = Serving (2 cols, fixed types) */}
                    <div className="mx-auto grid h-full w-full max-w-7xl gap-4 lg:grid-cols-12">
                        {/* Left column */}
                        <section className="flex min-h-0 flex-col gap-4 lg:col-span-7">
                            {/* Video */}
                            <div>
                                <header className="mb-3 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold tracking-wide text-slate-800 md:text-2xl dark:text-slate-200">
                                        <span className="bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent dark:from-slate-200 dark:to-slate-400">
                                            Department of Social Welfare and Development
                                        </span>
                                    </h2>
                                </header>
                                <VideoSlot emptyText="No video found." />
                            </div>

                            {/* Waiting (fills the rest) */}
                            <div className="flex min-h-0 flex-1 flex-col gap-3">
                                <header className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold tracking-wide text-slate-800 md:text-xl dark:text-slate-200">
                                        <span className="bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent dark:from-slate-200 dark:to-slate-400">
                                            Please Wait
                                        </span>
                                    </h3>
                                    <div className="rounded-full bg-slate-200/70 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                                        {waitingTickets.length} queued
                                    </div>
                                </header>
                                <div ref={waitingWrapRef} className="min-h-0 flex-1">
                                    {/* horizontal padding provides left/right spacing for the card grid */}
                                    <div className="grid h-full grid-cols-1 gap-3 px-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                                        {loading && waitingTickets.length === 0 && (
                                            <>
                                                {Array.from({ length: 2 }).map((_, i) => (
                                                    <div
                                                        key={`w-skel-${i}`}
                                                        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40"
                                                    >
                                                        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-800/40 dark:via-slate-800/10 dark:to-slate-900/40" />
                                                        <div className="relative mb-6 h-8 w-24 rounded bg-slate-200 dark:bg-slate-700/40" />
                                                        <div className="relative h-10 w-32 rounded bg-slate-200 dark:bg-slate-700/40" />
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                        {!loading && waitingLimited.length === 0 && (
                                            <div className="col-span-full flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-400">
                                                No waiting tickets
                                            </div>
                                        )}
                                        {waitingLimited.map((t) => (
                                            <div
                                                key={`waiting-${t.id}`}
                                                className="group relative flex h-16 items-center justify-between gap-3 overflow-hidden rounded-lg border border-slate-200 bg-white px-4 py-2 whitespace-nowrap shadow-sm ring-1 ring-slate-200/50 transition hover:shadow-md hover:ring-slate-300/70 dark:border-slate-800/70 dark:bg-slate-900/60 dark:ring-slate-800/40 dark:hover:ring-slate-700/60"
                                            >
                                                {/* Left: Type chip */}
                                                {t.transaction_type_id && (
                                                    <span className="max-w-[40%] truncate rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium tracking-wide text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                                                        {t.transaction_type?.name}
                                                    </span>
                                                )}

                                                {/* Center: Number */}
                                                <div className="flex-1 overflow-hidden px-1 text-center">
                                                    <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 bg-clip-text text-3xl leading-none font-black tracking-tight text-transparent tabular-nums drop-shadow-sm dark:from-slate-200 dark:via-slate-300 dark:to-white">
                                                        {t.number}
                                                    </div>
                                                </div>

                                                {/* Right: Teller chip */}
                                                {t.teller_id && (
                                                    <div className="shrink-0 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium tracking-wide text-slate-700 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300">
                                                        Cntr {t.teller_id}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Right column: Serving (unchanged layout) */}
                        <section className="flex min-h-0 flex-col gap-3 lg:col-span-5">
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

                            <div ref={servingWrapRef} className="min-h-0 flex-1 overflow-hidden">
                                {!loading && guaranteeLimited.length === 0 && cashLimited.length === 0 ? (
                                    <div className="flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-400">
                                        No tickets are being served
                                    </div>
                                ) : (
                                    <div className="grid h-full grid-cols-2 gap-4">
                                        {/* Left column: Guarantee Letter */}
                                        <div className="flex min-h-0 flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                                                    {leftLabel}
                                                </span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">{guaranteeAll.length}</span>
                                            </div>
                                            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden">
                                                {guaranteeLimited.map((t) => {
                                                    const teller = t.teller_id ?? '—';
                                                    return (
                                                        <div
                                                            key={`serving-gl-${t.id}`}
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
                                                                <div className="bg-gradient-to-br from-yellow-500 via-amber-400 to-yellow-600 bg-clip-text text-6xl font-black tracking-tight text-transparent tabular-nums drop-shadow-sm md:text-7xl dark:from-amber-300 dark:via-yellow-200 dark:to-amber-400">
                                                                    {t.number}
                                                                </div>
                                                                {/* @ts-ignore */}
                                                                {t.transaction_type && (
                                                                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-medium tracking-wide text-slate-700 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-200">
                                                                        {/* @ts-ignore */}
                                                                        {t.transaction_type?.name}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        {/* Right column: Cash Assistance */}
                                        <div className="flex min-h-0 flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                                                    {rightLabel}
                                                </span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">{cashAll.length}</span>
                                            </div>
                                            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden">
                                                {cashLimited.map((t) => {
                                                    const teller = t.teller_id ?? '—';
                                                    return (
                                                        <div
                                                            key={`serving-ca-${t.id}`}
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
                                                                <div className="bg-gradient-to-br from-yellow-500 via-amber-400 to-yellow-600 bg-clip-text text-6xl font-black tracking-tight text-transparent tabular-nums drop-shadow-sm md:text-7xl dark:from-amber-300 dark:via-yellow-200 dark:to-amber-400">
                                                                    {t.number}
                                                                </div>
                                                                {/* @ts-ignore */}
                                                                {t.transaction_type && (
                                                                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-medium tracking-wide text-slate-700 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-200">
                                                                        {/* @ts-ignore */}
                                                                        {t.transaction_type?.name}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </main>

                {/* Footer */}
                <footer className="relative z-10 mt-auto w-full shrink-0 border-t border-slate-200/70 bg-white/80 py-3 text-center text-xs font-medium tracking-wide text-slate-600 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-400">
                    DSWD Queuing System • Real-time Serving Board
                </footer>
            </div>
        </>
    );
}

import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AppLogoIcon from './../../components/app-logo-icon';

// Update QueueTicket type to include ispriority
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
    ispriority?: number | boolean; // <-- added
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
// Build a local playlist from public/videos and auto-play/auto-next.
function VideoSlot({ emptyText = 'No video configured' }: { emptyText?: string }) {
    // Collect local videos from public/videos (including subfolders). Supported: mp4, webm, ogg
    const modules = import.meta.glob('/public/videos/**/*.{mp4,webm,ogg}', { eager: true, as: 'url' }) as Record<string, string>;
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
                        {emptyText} <br /> Place videos in public/videos
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

    // New: group waiting tickets by transaction type, then by priority
    // NOTE: use the full waitingTickets list (not the already-sliced waitingLimited) so priority separation is accurate.
    const waitingGroups = useMemo(() => {
        const map = new Map<string, { name: string; priority: QueueTicket[]; regular: QueueTicket[] }>();
        for (const t of waitingTickets) {
            const key = t.transaction_type?.name || 'Other';
            if (!map.has(key)) map.set(key, { name: key, priority: [], regular: [] });
            const bucket = map.get(key)!;
            const isPriority = t.ispriority === 1 || t.ispriority === true || String(t.ispriority) === '1';
            if (isPriority) bucket.priority.push(t);
            else bucket.regular.push(t);
        }

        if (transactionTypes && transactionTypes.length) {
            const ordered: { name: string; priority: QueueTicket[]; regular: QueueTicket[] }[] = [];
            for (const tt of transactionTypes) {
                const entry = map.get(tt.name);
                if (entry) ordered.push(entry);
            }
            for (const remaining of map.values()) {
                if (!ordered.find((o) => o.name === remaining.name)) ordered.push(remaining);
            }
            return ordered;
        }
        return Array.from(map.values());
    }, [waitingTickets, transactionTypes]);

    // --- NEW: waitingColumns (ordered per transactionTypes) ---
    const waitingColumns = useMemo(() => {
        // If transactionTypes exist: ensure same order as columns; otherwise fallback to waitingGroups
        if (transactionTypes && transactionTypes.length) {
            // create map from waitingGroups for O(1) lookup
            const mg = new Map(waitingGroups.map((g) => [g.name, g]));
            const ordered: { name: string; priority: QueueTicket[]; regular: QueueTicket[] }[] = [];
            for (const tt of transactionTypes) {
                const entry = mg.get(tt.name);
                if (entry) ordered.push(entry);
            }
            // append any left-over groups
            for (const g of waitingGroups) {
                if (!ordered.find((o) => o.name === g.name)) ordered.push(g);
            }
            return ordered;
        }
        return waitingGroups;
    }, [waitingGroups, transactionTypes]);

    // final rendering will cap items per group so Priority items are shown first,
    // then Regular items fill remaining visible slots per group.

    // --- REPLACE: previous left/right logic with dynamic N columns ---
    // Build dynamic columns from transactionTypes (one column per transaction type).
    // Fallback to two legacy labels when no transactionTypes provided.
    const txnTypes = transactionTypes && transactionTypes.length > 0 ? transactionTypes : null;
    const columns: string[] = txnTypes ? txnTypes.map((t) => String(t.name)) : ['Guarantee Letter', 'Cash Assistance'];
    // Safe alias: some compiled artifacts or older builds may reference colsFromTypes — keep compatibility.
    const colsFromTypes = columns;
    const numCols = Math.max(1, columns.length);
    const servingRows = Math.max(1, Math.floor(servingCapacity / numCols));
    // For each column, filter tickets matching the transaction type (case-insensitive)
    const columnTickets = columns.map((col) => servingTickets.filter((t) => (t.transaction_type?.name || '').toLowerCase() === col.toLowerCase()));
    const columnLimited = columnTickets.map((items) => items.slice(0, servingRows));
    const totalServing = servingTickets.length;
    // --- END REPLACEMENT ---

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
                                    <h2 className="flex items-center text-xl font-semibold tracking-wide text-slate-800 md:text-2xl dark:text-slate-200">
                                        <div className="bg-sidebar-primary-foreground mr-2 flex aspect-square size-8 items-center justify-center rounded-md">
                                            <AppLogoIcon className="size-7 fill-current text-white dark:text-black" />
                                        </div>
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
                                            Waiting List
                                        </span>
                                    </h3>
                                    <div className="rounded-full bg-slate-200/70 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                                        {waitingTickets.length} queued
                                    </div>
                                </header>
                                <div ref={waitingWrapRef} className="min-h-0 flex-1">
                                    {/* horizontal padding provides left/right spacing for the card grid */}
                                    <div className="grid h-full grid-cols-1 gap-3 px-3">
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

                                        {/* Render per-transaction-type groups as columns */}
                                        {waitingColumns.length === 0 ? (
                                            <div className="col-span-full flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-400">
                                                No waiting tickets
                                            </div>
                                        ) : (
                                            <div
                                                className="grid h-full gap-3"
                                                style={{ gridTemplateColumns: `repeat(${Math.max(1, waitingColumns.length)}, minmax(0, 1fr))` }}
                                            >
                                                {waitingColumns.map((col) => {
                                                    // determine how many items to show for this group (distribute overall capacity)
                                                    const perGroupCapacity = Math.max(
                                                        3,
                                                        Math.ceil(waitingCapacity / Math.max(1, waitingColumns.length)),
                                                    );
                                                    const displayPriority = col.priority.slice(0, perGroupCapacity);
                                                    const remaining = perGroupCapacity - displayPriority.length;
                                                    const displayRegular = col.regular.slice(0, Math.max(0, remaining));
                                                    const queuedCount = col.priority.length + col.regular.length;
                                                    return (
                                                        <div
                                                            key={`wg-col-${col.name}`}
                                                            className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50"
                                                        >
                                                            <div className="mb-2 flex items-center justify-between">
                                                                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                                    {col.name}
                                                                </div>
                                                                <div className="text-xs text-slate-500 dark:text-slate-400">{queuedCount} queued</div>
                                                            </div>

                                                            {/* Two-column inner layout: left = Regular, right = Priority */}
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                                                                        Regular
                                                                    </div>
                                                                    <div className="grid grid-cols-1 gap-2">
                                                                        {displayRegular.map((t) => (
                                                                            <div
                                                                                key={`w-reg-${t.id}`}
                                                                                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50"
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="text-lg font-black text-slate-800 tabular-nums dark:text-slate-100">
                                                                                        {t.number}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="text-xs text-slate-600 dark:text-slate-300">
                                                                                    {t.teller_id ? `Cntr ${t.teller_id}` : '—'}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                        {displayRegular.length === 0 && (
                                                                            <div className="text-xs text-slate-400">—</div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <div className="mb-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                                                                        Priority
                                                                    </div>
                                                                    <div className="grid grid-cols-1 gap-2">
                                                                        {displayPriority.map((t) => (
                                                                            <div
                                                                                key={`w-prio-${t.id}`}
                                                                                className="flex items-center justify-between gap-3 rounded-lg border border-amber-300 bg-gradient-to-r px-3 py-2 shadow-inner"
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="text-lg font-black text-amber-700 tabular-nums dark:text-amber-200">
                                                                                        {t.number}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="text-xs text-slate-600 dark:text-slate-300">
                                                                                    {t.teller_id ? `Cntr ${t.teller_id}` : '—'}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                        {displayPriority.length === 0 && (
                                                                            <div className="text-xs text-slate-400">—</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
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
                                {!loading && totalServing === 0 ? (
                                    <div className="flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-400">
                                        No tickets are being served
                                    </div>
                                ) : (
                                    // dynamic columns: one per transaction type in the order received
                                    <div className="grid h-full gap-4" style={{ gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))` }}>
                                        {columns.map((colLabel, ci) => {
                                            const items = columnLimited[ci] ?? [];
                                            const total = columnTickets[ci]?.length ?? 0;
                                            return (
                                                <div key={`col-${ci}`} className="flex min-h-0 flex-col gap-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                                                            {colLabel}
                                                        </span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">{total}</span>
                                                    </div>
                                                    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden">
                                                        {items.map((t) => {
                                                            const teller = t.teller_id ?? '—';
                                                            return (
                                                                <div
                                                                    key={`serving-${ci}-${t.id}`}
                                                                    className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl ring-1 ring-slate-200/60 transition hover:shadow-2xl hover:ring-slate-300/70 dark:border-slate-800/70 dark:bg-gradient-to-br dark:from-slate-900/70 dark:via-slate-900/60 dark:to-slate-950/70 dark:ring-slate-800/50 dark:hover:ring-slate-700/70"
                                                                >
                                                                    {/* Brand hover glows */}
                                                                    <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                                                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.10),transparent_65%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.10),transparent_65%)]" />
                                                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(239,68,68,0.10),transparent_55%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(239,68,68,0.10),transparent_55%)]" />
                                                                    </div>
                                                                    <div className="relative flex items-center justify-center gap-2 px-5">
                                                                        <span className="rounded-full bg-red-100 px-4 py-1 text-[10px] font-semibold tracking-wider text-red-700 uppercase dark:bg-rose-500/15 dark:text-rose-300">
                                                                            Serving
                                                                        </span>

                                                                        <div className="flex items-center gap-2">
                                                                            {(t.ispriority === 1 || String(t.ispriority) === '1') && (
                                                                                <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold tracking-wider text-amber-800 uppercase dark:bg-amber-500/10 dark:text-amber-300">
                                                                                    PRIORITY
                                                                                </span>
                                                                            )}
                                                                        </div>
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
                                                                        <span className="rounded-full bg-blue-100 px-4 py-1 text-[10px] font-semibold tracking-wider text-blue-700 uppercase dark:bg-indigo-500/15 dark:text-indigo-300">
                                                                            Teller {teller}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
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

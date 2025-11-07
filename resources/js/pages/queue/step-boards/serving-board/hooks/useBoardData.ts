import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import type { BoardData, QueueTicket } from '../types';

function speakNowServing(ticket: QueueTicket): void {
    try {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

        const isPriority = ticket.ispriority === 1 || ticket.ispriority === true || String(ticket.ispriority) === '1';
        const kind = isPriority ? 'priority' : 'regular';
        const ttName = typeof ticket.transaction_type === 'string' ? ticket.transaction_type : ticket.transaction_type?.name || '';
        const text = `Now Serving, ${kind} ${ttName} number ${ticket.number}`;

        const speakNow = () => {
            try {
                window.speechSynthesis.cancel();
                const u = new SpeechSynthesisUtterance(text);
                u.lang = 'en-US';
                u.rate = 1;
                u.pitch = 1.15;
                const voices = window.speechSynthesis.getVoices() || [];
                const femalePatterns = [/samantha/i, /joanna/i, /amy/i, /zira/i, /victoria/i, /alloy/i, /arielle/i, /google uk english female/i, /google us english/i, /microsoft zira/i, /female/i];
                let selected = voices.find((v) => femalePatterns.some((rx) => rx.test(v.name))) || voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('en')) || voices[0] || null;
                if (selected) u.voice = selected;
                window.speechSynthesis.speak(u);
            } catch (e) {
                console.error('TTS speak error', e);
            }
        };

        const voices = window.speechSynthesis.getVoices();
        if (!voices || voices.length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                speakNow();
                window.speechSynthesis.onvoiceschanged = null;
            };
        } else {
            speakNow();
        }
    } catch (e) {
        console.error('TTS error', e);
    }
}

export function useBoardData(initial: BoardData, options?: { polling?: boolean }) {
    const [servingTickets, setServingTickets] = useState<QueueTicket[]>(initial.serving || []);
    const [waitingTickets, setWaitingTickets] = useState<QueueTicket[]>(initial.waiting || []);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(initial.generated_at ? new Date(initial.generated_at) : null);
    const [redirectError, setRedirectError] = useState<string | null>(null);

    const prevServingIdsRef = useRef<number[]>([]);
    const initialFetchRef = useRef(true);
    const pollRef = useRef<number | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const seqRef = useRef(0);
    const failuresRef = useRef(0);

    const pollingEnabled = options?.polling !== false;

    const fetchBoard = async () => {
        const seq = ++seqRef.current;
        try {
            setLoading(true);

            if (abortRef.current) abortRef.current.abort();
            const ac = new AbortController();
            abortRef.current = ac;

            let url: string;
            try {
                // @ts-ignore Ziggy route
                url = route('queue.board.data') + '?step=2';
            } catch {
                url = '/queue/board-data?step=2';
            }
            // cache-busting param to avoid any proxy/browser caching
            url = `${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`;

            const res = await fetch(url, {
                headers: { Accept: 'application/json', 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
                cache: 'no-store',
                signal: ac.signal,
            });
            const contentType = res.headers.get('content-type') || '';

            if (res.redirected || (!contentType.includes('application/json') && !res.ok)) {
                setRedirectError('The endpoint is redirecting or not returning JSON. Ensure GET /queue/board-data?step=2 is public.');
                failuresRef.current += 1;
                if (failuresRef.current >= 2) {
                    try { router.reload({ only: ['boardData', 'transactionTypes', 'tellers'] }); } catch { }
                }
                return;
            }

            if (!res.ok) throw new Error('Failed to fetch queue board data.');

            const json: BoardData = await res.json();

            // Ignore out-of-order responses
            if (seq !== seqRef.current) return;

            const newServing: QueueTicket[] = json.serving || [];
            const newIds = newServing.map((s) => s.id);
            const prevIds = prevServingIdsRef.current || [];
            const addedIds = newIds.filter((id) => !prevIds.includes(id));

            if (!initialFetchRef.current && addedIds.length > 0) {
                for (const id of addedIds) {
                    const ticket = newServing.find((t) => t.id === id);
                    if (ticket) speakNowServing(ticket);
                }
            }

            prevServingIdsRef.current = newIds;
            initialFetchRef.current = false;
            failuresRef.current = 0;

            setServingTickets(newServing);
            setWaitingTickets(json.waiting || []);
            setLastUpdated(json.generated_at ? new Date(json.generated_at) : new Date());
        } catch (e: any) {
            if (e?.name === 'AbortError') return; // ignore aborted
            console.error('[queue-board] fetch error', e);
            failuresRef.current += 1;
            if (failuresRef.current >= 3) {
                try { router.reload({ only: ['boardData', 'transactionTypes', 'tellers'] }); } catch { }
            }
        } finally {
            setLoading(false);
        }
    };

    // Sync with server-provided props when they change (e.g., via Inertia partial reload)
    useEffect(() => {
        try {
            const nextServing = initial.serving || [];
            const nextWaiting = initial.waiting || [];
            const nextUpdated = initial.generated_at ? new Date(initial.generated_at) : new Date();

            // Speak for new tickets if not the initial render
            const nextIds = nextServing.map((s) => s.id);
            const prevIds = prevServingIdsRef.current || [];
            const added = nextIds.filter((id) => !prevIds.includes(id));
            if (!initialFetchRef.current && added.length > 0) {
                for (const id of added) {
                    const ticket = nextServing.find((t) => t.id === id);
                    if (ticket) speakNowServing(ticket as QueueTicket);
                }
            }

            setServingTickets(nextServing);
            setWaitingTickets(nextWaiting);
            setLastUpdated(nextUpdated);
            prevServingIdsRef.current = nextIds;
            initialFetchRef.current = false;
        } catch { }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initial]);

    useEffect(() => {
        if (!pollingEnabled) return;
        fetchBoard();
        const id = window.setInterval(fetchBoard, 5000);
        pollRef.current = id;

        const onVisibility = () => { if (document.visibilityState === 'visible') fetchBoard(); };
        const onFocus = () => fetchBoard();
        const onOnline = () => fetchBoard();
        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('focus', onFocus);
        window.addEventListener('online', onOnline);

        return () => {
            if (pollRef.current !== null) window.clearInterval(pollRef.current);
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('focus', onFocus);
            window.removeEventListener('online', onOnline);
            if (abortRef.current) abortRef.current.abort();
        };
    }, [pollingEnabled]);

    return { servingTickets, waitingTickets, loading, lastUpdated, redirectError, fetchNow: fetchBoard };
}

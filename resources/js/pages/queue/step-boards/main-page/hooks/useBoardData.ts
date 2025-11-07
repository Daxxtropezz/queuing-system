import { useEffect, useRef, useState } from 'react';
import type { BoardData, QueueTicket } from '../types';

const EMPTY_CLEAR_THRESHOLD = 3;

function isPriority(v: unknown): boolean {
    return v === 1 || v === true || String(v) === '1';
}

function filterServingTickets(list: QueueTicket[] = []): QueueTicket[] {
    return list.filter((t) => {
        const stepIsOne = String(t.step) === '1' || t.step === 1;
        const statusServing = String(t.status || '').toLowerCase() === 'serving';
        return stepIsOne && statusServing;
    });
}

function speakNowServing(ticket: QueueTicket): void {
    try {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

        const kind = isPriority(ticket.ispriority) ? 'priority' : 'regular';
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
                const selected = voices.find((v) => femalePatterns.some((rx) => rx.test(v.name))) || voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('en')) || voices[0] || null;
                if (selected) (u as any).voice = selected;
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

export function useBoardData(initial: BoardData) {
    const [servingTickets, setServingTickets] = useState<QueueTicket[]>(() => filterServingTickets(initial.serving || []));
    const [displayServingTickets, setDisplayServingTickets] = useState<QueueTicket[]>(() => filterServingTickets(initial.serving || []));
    const [waitingTickets, setWaitingTickets] = useState<QueueTicket[]>(initial.waiting || []);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(initial.generated_at ? new Date(initial.generated_at) : null);
    const [redirectError, setRedirectError] = useState<string | null>(null);

    const prevServingIdsRef = useRef<number[]>([]);
    const initialFetchRef = useRef(true);
    const consecutiveEmptyRef = useRef(0);
    const lastGeneratedRef = useRef<Date | null>(initial.generated_at ? new Date(initial.generated_at) : null);
    const pollRef = useRef<number | null>(null);

    useEffect(() => {
        prevServingIdsRef.current = displayServingTickets.map((t) => t.id);
    }, []);

    // Sync with updated server props (from Inertia partial reload) so lists update without manual refresh
    useEffect(() => {
        const serverTs = initial.generated_at ? new Date(initial.generated_at) : null;
        const nextServing = filterServingTickets(initial.serving || []);
        const nextWaiting = initial.waiting || [];
        const nextIds = nextServing.map((t) => t.id);
        const prevIds = prevServingIdsRef.current || [];
        const idsEqual = (a: number[], b: number[]) => a.length === b.length && b.every((x) => a.includes(x));

        if (serverTs && lastGeneratedRef.current && serverTs <= lastGeneratedRef.current && idsEqual(nextIds, prevIds)) {
            setWaitingTickets(nextWaiting);
            return;
        }

        prevServingIdsRef.current = nextIds;
        setServingTickets(nextServing);
        setDisplayServingTickets(nextServing);
        setWaitingTickets(nextWaiting);
        lastGeneratedRef.current = serverTs;
        setLastUpdated(serverTs);
        initialFetchRef.current = false;
        consecutiveEmptyRef.current = nextServing.length === 0 ? consecutiveEmptyRef.current + 1 : 0;
    }, [initial.generated_at, initial.serving, initial.waiting]);

    const fetchBoard = async () => {
        try {
            setLoading(true);
            let url: string;
            try {
                // @ts-ignore Ziggy route (if registered)
                url = route('queue.board.data');
            } catch {
                url = '/queue/board-data';
            }

            const res = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });
            const contentType = res.headers.get('content-type') || '';

            if (res.redirected || (!contentType.includes('application/json') && !res.ok)) {
                setRedirectError('The endpoint is redirecting or not returning JSON. Ensure GET /queue/board-data is public.');
                return;
            }

            if (!res.ok) throw new Error('Failed to fetch queue board data.');

            const json: BoardData = await res.json();
            const rawServing: QueueTicket[] = json.serving || [];
            const newServing: QueueTicket[] = filterServingTickets(rawServing);
            const newIds = newServing.map((s) => s.id);
            const prevIds = prevServingIdsRef.current || [];
            const addedIds = newIds.filter((id) => !prevIds.includes(id));

            const serverTs = json.generated_at ? new Date(json.generated_at) : new Date();
            const idsEqual = (a: number[], b: number[]) => a.length === b.length && b.every((x) => a.includes(x));

            if (lastGeneratedRef.current && serverTs <= lastGeneratedRef.current && idsEqual(newIds, prevIds)) {
                setWaitingTickets(json.waiting || []);
                return;
            }

            if (!initialFetchRef.current && addedIds.length > 0) {
                for (const id of addedIds) {
                    const ticket = newServing.find((t) => t.id === id);
                    if (ticket) speakNowServing(ticket);
                }
            }

            if (newServing.length > 0) {
                consecutiveEmptyRef.current = 0;
                prevServingIdsRef.current = newIds;
                setServingTickets(newServing);
                setDisplayServingTickets(newServing);
                initialFetchRef.current = false;
                lastGeneratedRef.current = serverTs;
                setLastUpdated(serverTs);
            } else {
                if (initialFetchRef.current) {
                    initialFetchRef.current = false;
                    setServingTickets([]);
                    consecutiveEmptyRef.current = 1;
                    lastGeneratedRef.current = serverTs;
                    setLastUpdated(serverTs);
                } else {
                    consecutiveEmptyRef.current += 1;
                    if (consecutiveEmptyRef.current >= EMPTY_CLEAR_THRESHOLD) {
                        prevServingIdsRef.current = [];
                        setServingTickets([]);
                        setDisplayServingTickets([]);
                        consecutiveEmptyRef.current = 0;
                        lastGeneratedRef.current = serverTs;
                        setLastUpdated(serverTs);
                    }
                }
            }

            setWaitingTickets(json.waiting || []);
        } catch (e) {
            console.error('[queue-main] fetch error', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoard();
        const id = window.setInterval(fetchBoard, 5000);
        pollRef.current = id;
        return () => { if (pollRef.current !== null) window.clearInterval(pollRef.current); };
    }, []);

    return { servingTickets, displayServingTickets, waitingTickets, loading, lastUpdated, redirectError, fetchNow: fetchBoard };
}

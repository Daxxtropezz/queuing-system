import { useEffect, useRef, useState } from 'react';
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

export function useBoardData(initial: BoardData) {
    const [servingTickets, setServingTickets] = useState<QueueTicket[]>(initial.serving || []);
    const [waitingTickets, setWaitingTickets] = useState<QueueTicket[]>(initial.waiting || []);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(initial.generated_at ? new Date(initial.generated_at) : null);
    const [redirectError, setRedirectError] = useState<string | null>(null);

    const prevServingIdsRef = useRef<number[]>([]);
    const initialFetchRef = useRef(true);
    const pollRef = useRef<number | null>(null);

    const fetchBoard = async () => {
        try {
            setLoading(true);
            let url: string;
            try {
                // @ts-ignore Ziggy route
                url = route('queue.board.data') + '?step=2';
            } catch {
                url = '/queue/board-data?step=2';
            }

            const res = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });
            const contentType = res.headers.get('content-type') || '';

            if (res.redirected || (!contentType.includes('application/json') && !res.ok)) {
                setRedirectError('The endpoint is redirecting or not returning JSON. Ensure GET /queue/board-data?step=2 is public.');
                return;
            }

            if (!res.ok) throw new Error('Failed to fetch queue board data.');

            const json: BoardData = await res.json();

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

            setServingTickets(newServing);
            setWaitingTickets(json.waiting || []);
            setLastUpdated(json.generated_at ? new Date(json.generated_at) : new Date());
        } catch (e) {
            console.error('[queue-board] fetch error', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoard();
        const id = window.setInterval(fetchBoard, 5000);
        pollRef.current = id;
        return () => {
            if (pollRef.current !== null) window.clearInterval(pollRef.current);
        };
    }, []);

    return { servingTickets, waitingTickets, loading, lastUpdated, redirectError, fetchNow: fetchBoard };
}

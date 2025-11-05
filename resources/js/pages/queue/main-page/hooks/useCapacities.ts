import { useEffect, useRef, useState } from 'react';

export function useCapacities() {
    const servingWrapRef = useRef<HTMLDivElement | null>(null);
    const waitingWrapRef = useRef<HTMLDivElement | null>(null);
    const [servingCapacity, setServingCapacity] = useState(4);
    const [waitingCapacity, setWaitingCapacity] = useState(4);

    useEffect(() => {
        const ro = new ResizeObserver(() => {
            if (servingWrapRef.current) {
                const h = servingWrapRef.current.clientHeight;
                const rowH = 200 + 20;
                const rows = Math.max(1, Math.floor((h + 20) / rowH));
                setServingCapacity(rows * 2);
            }
            if (waitingWrapRef.current) {
                const el = waitingWrapRef.current;
                const h = el.clientHeight;
                const w = el.clientWidth;
                const cols = w >= 1280 ? 5 : w >= 1024 ? 4 : w >= 768 ? 3 : w >= 640 ? 2 : 1;
                const rowH = 64 + 12;
                const rows = Math.max(1, Math.floor((h + 12) / rowH));
                const capacity = rows * cols;
                setWaitingCapacity(Math.max(5, capacity));
            }
        });

        if (servingWrapRef.current) ro.observe(servingWrapRef.current);
        if (waitingWrapRef.current) ro.observe(waitingWrapRef.current);
        ro.observe(document.body);
        return () => ro.disconnect();
    }, []);

    return { servingWrapRef, waitingWrapRef, servingCapacity, waitingCapacity } as const;
}

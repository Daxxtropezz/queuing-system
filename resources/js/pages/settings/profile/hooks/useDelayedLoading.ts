import { useEffect, useState } from 'react';

export default function useDelayedLoading(delayMs = 1200, initial = true) {
    const [loading, setLoading] = useState(initial);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), delayMs);
        return () => clearTimeout(timer);
    }, [delayMs]);

    return loading;
}

import { useEffect, useState } from 'react';
import Box from '@/components/ui/box';

export default function HeaderBar({ lastUpdated, loading }: { lastUpdated: Date | null; loading: boolean }) {
    const [now, setNow] = useState<Date>(new Date());
    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(id);
    }, []);

    return (
        <header className="relative z-10 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/65 dark:border-slate-800/70 dark:bg-slate-900/70">
            <Box className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 md:px-6">
                <Box className="flex-shrink-0 px-4">
                    <h1 className="text-xl font-semibold tracking-wide text-slate-800 md:text-2xl lg:text-3xl dark:text-slate-200">
                        <span className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-clip-text text-transparent dark:from-amber-500 dark:via-yellow-400 dark:to-amber-500">{"Step 1"}</span>
                    </h1>
                </Box>
                <Box className="flex flex-wrap items-center gap-4 text-xs md:text-sm">
                    <Box className="rounded-full bg-slate-200/70 px-4 py-1 font-mono text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">{now.toLocaleTimeString()}</Box>
                    <Box className="rounded-full bg-slate-200/70 px-4 py-1 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">{lastUpdated ? `Last update: ${lastUpdated.toLocaleTimeString()}` : 'Initializing...'}</Box>
                    <Box className={['flex items-center gap-1 rounded-full px-4 py-1', loading ? 'bg-yellow-200/70 text-yellow-800 dark:bg-amber-500/10 dark:text-amber-300' : 'bg-emerald-200/70 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300',].join(' ')}>
                        <span className={['h-2 w-2 rounded-full', loading ? 'animate-pulse bg-yellow-500 dark:bg-amber-400' : 'bg-emerald-600 dark:bg-emerald-400',].join(' ')} />
                        {loading ? 'Refreshing…' : 'Live'}
                    </Box>
                </Box>
            </Box>
        </header>
    );
}

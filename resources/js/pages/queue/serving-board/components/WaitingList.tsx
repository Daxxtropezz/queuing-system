import { useMemo } from 'react';
import Box from '@/components/ui/box';
import type { QueueTicket, TransactionType } from '../types';
import { isPriority } from '../utils';

interface Props {
    waitingTickets: QueueTicket[];
    waitingCapacity: number;
    transactionTypes?: TransactionType[];
    getTellerName: (t: QueueTicket) => string;
}

export default function WaitingList({ waitingTickets, waitingCapacity, transactionTypes = [], getTellerName }: Props) {
    const waitingColumns = useMemo(() => {
        const map = new Map<string, { name: string; priority: QueueTicket[]; regular: QueueTicket[] }>();
        for (const t of waitingTickets) {
            const key = (typeof t.transaction_type === 'string' ? t.transaction_type : t.transaction_type?.name) || 'Other';
            if (!map.has(key)) map.set(key, { name: key, priority: [], regular: [] });
            const bucket = map.get(key)!;
            if (isPriority(t.ispriority)) bucket.priority.push(t);
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

    if (waitingColumns.length === 0) {
        return (
            <Box className="col-span-full flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-400">
                {"No waiting tickets"}
            </Box>
        );
    }

    return (
        <Box className="grid h-full gap-3" style={{ gridTemplateColumns: `repeat(${Math.max(1, waitingColumns.length)}, minmax(0, 1fr))` }}>
            {waitingColumns.map((col) => {
                const perGroupCapacity = Math.max(3, Math.ceil(waitingCapacity / Math.max(1, waitingColumns.length)));
                const allTickets = [...col.priority.filter((t) => isPriority(t.ispriority)), ...col.regular].slice(0, perGroupCapacity);
                const displayPriority = allTickets.filter((t) => isPriority(t.ispriority));
                const displayRegular = allTickets.filter((t) => !isPriority(t.ispriority));
                const queuedCount = col.priority.length + col.regular.length;

                return (
                    <Box key={`wg-col-${col.name}`} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                        <Box className="mb-2 flex items-center justify-between">
                            <Box className="text-sm font-semibold text-slate-700 dark:text-slate-200">{col.name}</Box>
                            <Box className="text-xs text-slate-500 dark:text-slate-400">{queuedCount} {"queued"}</Box>
                        </Box>
                        <Box className="grid grid-cols-2 gap-3">
                            <Box className="space-y-3 overflow-auto" style={{ maxHeight: '56vh' }}>
                                {displayRegular.length ? (
                                    displayRegular.map((t) => (
                                        <Box key={`w-reg-${t.id}`} className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                                            <Box className="text-lg font-black text-slate-800 tabular-nums dark:text-slate-100">{t.number}</Box>
                                            <Box className="text-xs text-slate-600 dark:text-slate-300">{getTellerName(t)}</Box>
                                        </Box>
                                    ))
                                ) : (
                                    <Box className="text-xs text-slate-400">{"—"}</Box>
                                )}
                            </Box>
                            <Box className="space-y-3 overflow-auto" style={{ maxHeight: '56vh' }}>
                                {displayPriority.length ? (
                                    displayPriority.map((t) => (
                                        <Box key={`w-prio-${t.id}`} className="flex flex-col items-center gap-1 rounded-lg border border-amber-300 bg-gradient-to-r px-3 py-2 shadow-inner">
                                            <Box className="text-lg font-black text-amber-700 tabular-nums dark:text-amber-200">{t.number}</Box>
                                            <Box className="text-xs text-slate-600 dark:text-slate-300">{getTellerName(t)}</Box>
                                        </Box>
                                    ))
                                ) : (
                                    <Box className="text-xs text-slate-400">{"—"}</Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
}

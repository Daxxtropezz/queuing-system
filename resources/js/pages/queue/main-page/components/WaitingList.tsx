import Box from '@/components/ui/box';
import type { QueueTicket, TransactionType } from '../types';
import { buildWaitingColumns } from '../utils';

interface Props {
    waitingTickets: QueueTicket[];
    transactionTypes?: TransactionType[];
}

export default function WaitingList({ waitingTickets, transactionTypes = [] }: Props) {
    const waitingColumns = buildWaitingColumns(waitingTickets, transactionTypes);

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
                const displayPriority = col.priority;
                const displayRegular = col.regular;
                const queuedCount = displayPriority.length + displayRegular.length;
                return (
                    <Box key={`wg-col-${col.name}`} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                        <Box className="mb-2 flex items-center justify-between">
                            <Box className="text-sm font-semibold text-slate-700 dark:text-slate-200">{col.name}</Box>
                            <Box className="text-xs text-slate-500 dark:text-slate-400">{queuedCount} {"queued"}</Box>
                        </Box>
                        <Box className="grid grid-cols-2 gap-3">
                            <Box>
                                <Box className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">{"Regular"}</Box>
                                <Box className="grid grid-cols-1 gap-2 overflow-auto" style={{ maxHeight: '56vh' }}>
                                    {displayRegular.map((t) => (
                                        <Box key={`w-reg-${t.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                                            <Box className="flex items-center gap-3">
                                                <Box className="text-lg font-black text-slate-800 tabular-nums dark:text-slate-100">{t.number}</Box>
                                            </Box>
                                            <Box className="text-xs text-slate-600 dark:text-slate-300">{t.teller_id ? `Teller ${t.teller_id}` : '—'}</Box>
                                        </Box>
                                    ))}
                                    {displayRegular.length === 0 && <Box className="text-xs text-slate-400">{"—"}</Box>}
                                </Box>
                            </Box>
                            <Box>
                                <Box className="mb-1 text-xs font-medium text-amber-700 dark:text-amber-300">{"Priority"}</Box>
                                <Box className="grid grid-cols-1 gap-2 overflow-auto" style={{ maxHeight: '56vh' }}>
                                    {displayPriority.map((t) => (
                                        <Box key={`w-prio-${t.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-amber-300 bg-gradient-to-r px-3 py-2 shadow-inner">
                                            <Box className="flex items-center gap-3">
                                                <Box className="text-lg font-black text-amber-700 tabular-nums dark:text-amber-200">{t.number}</Box>
                                            </Box>
                                            <Box className="text-xs text-slate-600 dark:text-slate-300">{t.teller_id ? `Teller ${t.teller_id}` : '—'}</Box>
                                        </Box>
                                    ))}
                                    {displayPriority.length === 0 && <Box className="text-xs text-slate-400">{"—"}</Box>}
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
}

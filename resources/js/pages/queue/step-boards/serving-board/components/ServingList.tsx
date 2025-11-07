import Box from '@/components/ui/box';
import type { QueueTicket, TransactionType } from '../types';
import { isPriority } from '../utils';

interface Props {
    servingTickets: QueueTicket[];
    servingCapacity: number;
    transactionTypes?: TransactionType[];
    getTellerName: (t: QueueTicket) => string;
}

export default function ServingList({ servingTickets, servingCapacity, transactionTypes = [], getTellerName }: Props) {
    // Helper to prefix ticket number with P/R and pad to 4 digits
    const formatDisplayNumber = (t: QueueTicket) => {
        const raw = String(t.number ?? '').replace(/\D/g, '');
        const padded = raw.padStart(4, '0');
        return `${isPriority(t.ispriority) ? 'P' : 'R'}${padded}`;
    };

    const columns: string[] = transactionTypes && transactionTypes.length > 0 ? transactionTypes.map((t) => String(t.name)) : ['Guarantee Letter', 'Cash Assistance'];
    const numCols = Math.max(1, columns.length);
    const servingRows = Math.max(1, Math.floor(servingCapacity / numCols));

    const columnTickets = columns.map((col) => servingTickets.filter((t) => ((typeof t.transaction_type === 'string' ? t.transaction_type : t.transaction_type?.name) || '').toLowerCase() === col.toLowerCase()));

    if (servingTickets.length === 0) {
        return (
            <Box className="flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-400">
                {"No tickets are being served"}
            </Box>
        );
    }

    return (
        <Box className="grid h-full gap-4" style={{ gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))` }}>
            {columns.map((colLabel, ci) => {
                const allItems = columnTickets[ci] ?? [];
                const total = allItems.length;
                const perGroupCapacity = Math.max(1, servingRows);

                const priorityTickets = allItems.filter((t) => isPriority(t.ispriority));
                const regularTickets = allItems.filter((t) => !isPriority(t.ispriority));
                const sortedTickets = [...priorityTickets, ...regularTickets].slice(0, perGroupCapacity);
                const priorityItems = sortedTickets.filter((t) => isPriority(t.ispriority));
                const regularItems = sortedTickets.filter((t) => !isPriority(t.ispriority));

                return (
                    <Box key={`col-${ci}`} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                        <Box className="mb-2 flex items-center justify-between">
                            <Box className="text-sm font-semibold text-slate-700 dark:text-slate-200">{colLabel}</Box>
                            <Box className="text-xs text-slate-500 dark:text-slate-400">{total} {"active"}</Box>
                        </Box>
                        <Box className="grid grid-cols-2 gap-3">
                            <Box>
                                <Box className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Regular</Box>
                                <Box className="grid grid-cols-1 gap-2">
                                    {regularItems.map((t) => (
                                        <Box key={`s-reg-${t.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                                            <Box className="flex flex-col items-center gap-1">
                                                <Box className="text-2xl font-black text-slate-800 tabular-nums md:text-3xl dark:text-slate-100">{formatDisplayNumber(t)}</Box>
                                                <Box className="text-xs text-slate-600 dark:text-slate-300">{getTellerName(t)}</Box>
                                            </Box>
                                        </Box>
                                    ))}
                                    {regularItems.length === 0 && <Box className="text-xs text-slate-400">-</Box>}
                                </Box>
                            </Box>
                            <Box>
                                <Box className="mb-1 text-xs font-medium text-amber-700 dark:text-amber-300">{"Priority"}</Box>
                                <Box className="grid grid-cols-1 gap-2">
                                    {priorityItems.map((t) => (
                                        <Box key={`s-prio-${t.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-amber-300 bg-gradient-to-r px-3 py-2 shadow-inner">
                                            <Box className="flex flex-col items-center gap-1">
                                                <Box className="text-2xl font-black text-amber-700 tabular-nums md:text-3xl dark:text-amber-200">{formatDisplayNumber(t)}</Box>
                                                <Box className="text-xs text-slate-600 dark:text-slate-300">{getTellerName(t)}</Box>
                                            </Box>
                                        </Box>
                                    ))}
                                    {priorityItems.length === 0 && <Box className="text-xs text-slate-400">—</Box>}
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
}

import Box from '@/components/ui/box';
import type { QueueTicket } from '../types';
import { formatTicketNumber } from '../utils';

function isPriority(v: unknown): boolean { return v === 1 || v === true || String(v) === '1'; }

interface Props {
    tickets: QueueTicket[];
    servingCapacity: number;
    loading?: boolean;
}

export default function ServingList({ tickets, servingCapacity, loading = false }: Props) {
    if (tickets.length === 0 && !loading) {
        return (
            <Box className="h-full rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-400">
                {"No tickets are being served"}
            </Box>
        );
    }

    const leftServing = tickets.filter((t) => !isPriority(t.ispriority));
    const rightServing = tickets.filter((t) => isPriority(t.ispriority));

    return (
        <Box className="grid h-full grid-cols-2 gap-4">
            <Box className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                <Box className="mb-2 flex items-center justify-between">
                    <Box className="text-sm font-semibold text-slate-700 dark:text-slate-200">{"Regular"}</Box>
                    <Box className="text-xs text-slate-500 dark:text-slate-400">{leftServing.length} {"active"}</Box>
                </Box>
                <Box className="grid grid-cols-1 gap-3 overflow-auto" style={{ maxHeight: '56vh' }}>
                    {leftServing.slice(0, Math.max(1, Math.floor(servingCapacity / 2))).map((t) => (
                        <Box key={`s-reg-${t.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                            <Box className="flex items-center gap-3">
                                <Box className="text-2xl font-black text-slate-800 tabular-nums md:text-3xl dark:text-slate-100">{formatTicketNumber(t)}</Box>
                            </Box>
                            <Box className="text-xs text-slate-600 dark:text-slate-300">{t.teller_id ? `Teller ${t.teller_id}` : '—'}</Box>
                        </Box>
                    ))}
                    {leftServing.length === 0 && <Box className="text-xs text-slate-400">{"—"}</Box>}
                </Box>
            </Box>

            <Box className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
                <Box className="mb-2 flex items-center justify-between">
                    <Box className="text-sm font-semibold text-amber-700 dark:text-amber-300">{"Priority"}</Box>
                    <Box className="text-xs text-slate-500 dark:text-slate-400">{rightServing.length} {"active"}</Box>
                </Box>
                <Box className="grid grid-cols-1 gap-3 overflow-auto" style={{ maxHeight: '56vh' }}>
                    {rightServing.slice(0, Math.max(1, Math.ceil(servingCapacity / 2))).map((t) => (
                        <Box key={`s-prio-${t.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-amber-300 bg-gradient-to-r px-3 py-2 shadow-inner">
                            <Box className="flex items-center gap-3">
                                <Box className="text-2xl font-black text-amber-700 tabular-nums md:text-3xl dark:text-amber-200">{formatTicketNumber(t)}</Box>
                            </Box>
                            <Box className="text-xs text-slate-600 dark:text-slate-300">{t.teller_id ? `Teller ${t.teller_id}` : '—'}</Box>
                        </Box>
                    ))}
                    {rightServing.length === 0 && <Box className="text-xs text-slate-400">{"—"}</Box>}
                </Box>
            </Box>
        </Box>
    );
}

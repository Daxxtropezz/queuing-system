import type { QueueTicket, TransactionType } from '../types';

export const isPriority = (v: unknown): boolean => v === 1 || v === true || String(v) === '1';

export function buildWaitingColumns(waitingTickets: QueueTicket[], transactionTypes: TransactionType[] = []) {
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
}

// Add a unified formatter for displaying queue numbers with P/R prefix
export function formatTicketNumber(t: Pick<QueueTicket, 'number' | 'ispriority'>): string {
    const prefix = isPriority(t.ispriority) ? 'P' : 'R';
    const raw = String(t.number ?? '');
    const digits = raw.replace(/\D/g, '');
    const num = digits ? parseInt(digits, 10) : NaN;
    const padded = Number.isFinite(num) ? String(num).padStart(4, '0') : raw.padStart(4, '0');
    return `${prefix}${padded}`;
}

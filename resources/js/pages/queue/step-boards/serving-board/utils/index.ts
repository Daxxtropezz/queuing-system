import type { QueueTicket, Teller } from '../types';

export const isPriority = (v: unknown): boolean => v === 1 || v === true || String(v) === '1';

export function buildTellerMap(tellers: Teller[] = []): Map<number, string> {
    const m = new Map<number, string>();
    for (const t of tellers) {
        if (t && typeof t.id !== 'undefined') m.set(Number(t.id), t.name);
    }
    return m;
}

export function getTellerName(t: QueueTicket, tellerMap: Map<number, string>): string {
    if (t?.teller?.name) return t.teller.name;
    if (t?.teller && typeof (t.teller as any).id !== 'undefined') {
        const id = Number((t.teller as any).id);
        const name = tellerMap.get(id);
        if (name) return name;
    }
    if (typeof t?.teller_id !== 'undefined' && t?.teller_id !== null) {
        const name = tellerMap.get(Number(t.teller_id));
        if (name) return name;
    }
    return '—';
}

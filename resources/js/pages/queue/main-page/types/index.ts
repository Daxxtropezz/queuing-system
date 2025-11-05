// Shared types for Main Page (Step 1)

export type QueueTicket = {
    id: number;
    number: string | number;
    transaction_type_id?: string;
    transaction_type?: { name: string } | string | null;
    status?: 'waiting' | 'serving' | string;
    served_by?: string | number;
    teller_id?: string;
    updated_at?: string;
    created_at?: string;
    ispriority?: number | boolean;
    step?: string | number;
};

export interface BoardData {
    serving: QueueTicket[];
    waiting: QueueTicket[];
    generated_at: string;
}

export type TransactionType = { id: number; name: string; description?: string;[key: string]: any };

export interface MainPageProps {
    boardData: BoardData;
    transactionTypes?: TransactionType[];
}

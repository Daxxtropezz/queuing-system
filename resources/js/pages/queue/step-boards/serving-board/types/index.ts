// Shared types for Serving Board

export type QueueTicket = {
    id: number;
    number: string | number;
    transaction_type_id?: string;
    transaction_type?: { name: string } | string | null;
    status?: 'waiting' | 'serving' | string;
    served_by?: string | number;
    teller?: { id: number; name: string } | null;
    teller_id?: number | string | null;
    updated_at?: string;
    created_at?: string;
    ispriority?: number | boolean;
};

export interface BoardData {
    serving: QueueTicket[];
    waiting: QueueTicket[];
    generated_at: string;
}

export type TransactionType = { id: number; name: string; description?: string;[key: string]: any };
export type Teller = { id: number; name: string };

export interface ServingBoardPageProps {
    boardData: BoardData;
    transactionTypes?: TransactionType[];
    tellers?: Teller[];
}

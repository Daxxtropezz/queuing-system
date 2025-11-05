export type VideoRecord = {
    id: number;
    title: string;
    description?: string | null;
    file_path: string;
};

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

export interface VideoFilters {
    search?: string;
    per_page?: number;
}

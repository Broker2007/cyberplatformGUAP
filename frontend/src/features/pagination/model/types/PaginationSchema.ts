export interface PaginationSchema {
    currentPage: number;
    perPage: number;
    totalPages: number;
    searchQuery: string;
}

export type PaginationState = Record<string, PaginationSchema>;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PaginationSchema, PaginationState } from '../types/PaginationSchema';

const createInitial = (): PaginationSchema => ({
    currentPage: 0,
    perPage: 0,
    totalPages: 0,
    searchQuery: '',
});

// 🔥 ДЕФОЛТНЫЕ SCOPE (ВАЖНО)
const initialState: PaginationState = {
    labs: createInitial(),
    news: createInitial(),
    newsAdmin: createInitial(),
    audit: createInitial(),
};

const getScope = (state: PaginationState, scope?: string) => {
    const key = scope || 'labs';

    if (!state[key]) {
        state[key] = createInitial();
    }

    return state[key];
};

const paginationSlice = createSlice({
    name: 'pagination',
    initialState,
    reducers: {
        setPage: (
            state,
            action: PayloadAction<{ page: number; scope?: string }>,
        ) => {
            const { page, scope } = action.payload;
            const s = getScope(state, scope);

            if (page >= 0 && page < s.totalPages) {
                s.currentPage = page;
            }
        },
        setPerPage: (
            state,
            action: PayloadAction<{ perPage: number; scope?: string }>,
        ) => {
            const s = getScope(state, action.payload.scope);
            s.perPage = action.payload.perPage;
        },
        nextPage: (state, action: PayloadAction<{ scope?: string }>) => {
            const s = getScope(state, action.payload.scope);

            if (s.currentPage < s.totalPages - 1) {
                s.currentPage += 1;
            }
        },

        prevPage: (state, action: PayloadAction<{ scope?: string }>) => {
            const s = getScope(state, action.payload.scope);

            if (s.currentPage > 0) {
                s.currentPage -= 1;
            }
        },

        setTotalPages: (
            state,
            action: PayloadAction<{ total: number; scope?: string }>,
        ) => {
            const { total, scope } = action.payload;
            const s = getScope(state, scope);

            s.totalPages = total;

            if (s.currentPage >= total) {
                s.currentPage = Math.max(0, total - 1);
            }
        },

        setSearchQuery: (
            state,
            action: PayloadAction<{ query: string; scope?: string }>,
        ) => {
            const { query, scope } = action.payload;
            const s = getScope(state, scope);

            s.searchQuery = query;
            s.currentPage = 0;
        },

        resetPagination: (
            state,
            action: PayloadAction<{ scope?: string }>,
        ) => {
            const s = getScope(state, action.payload.scope);
            Object.assign(s, createInitial());
        },
    },
});

export const { actions: paginationActions } = paginationSlice;
export const { reducer: paginationReducer } = paginationSlice;

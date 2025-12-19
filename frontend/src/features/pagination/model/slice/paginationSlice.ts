import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PaginationSchema } from '../types/PaginationSchema';

const initialState: PaginationSchema = {
    currentPage: 0,
    perPage: 6,
    totalPages: 0,
    searchQuery: '',
};

const paginationSlice = createSlice({
    name: 'pagination',
    initialState,
    reducers: {
        setPage: (state, action: PayloadAction<number>) => {
            if (action.payload >= 0 && action.payload < state.totalPages) {
                state.currentPage = action.payload;
            }
        },

        nextPage: (state) => {
            if (state.currentPage < state.totalPages - 1) {
                state.currentPage += 1;
            }
        },

        prevPage: (state) => {
            if (state.currentPage > 0) {
                state.currentPage -= 1;
            }
        },
        // setPerPage: (state, action: PayloadAction<number>) => {
        //     // Проверяем ограничения из схемы API (1-200)
        //     const perPage = Math.max(1, Math.min(200, action.payload));
        //     state.perPage = perPage;
        //     state.currentPage = 0; // сбрасываем на первую страницу при изменении размера
        // },
        resetPagination: (state) => {
            state.currentPage = 0;
        },

        // Установка общего количества страниц (с бэка)
        setTotalPages: (state, action: PayloadAction<number>) => {
            state.totalPages = action.payload;
            if (state.currentPage >= action.payload) {
                state.currentPage = Math.max(0, action.payload - 1);
            }
        },
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
            state.currentPage = 0;
        },

        clearSearch: (state) => {
            state.searchQuery = '';
            state.currentPage = 0;
        },
    },
});

export const { actions: paginationActions } = paginationSlice;
export const { reducer: paginationReducer } = paginationSlice;

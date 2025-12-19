import { useGetLabsQuery } from 'entities/labs/api/labsApi';
import { paginationActions } from 'features/pagination';
import { useCallback } from 'react';
import { useAppDispatch } from 'shared/lib/hooks/useAppDispatch';
import { useAppSelector } from 'shared/lib/hooks/useAppSelector';

export const useLabs = () => {
    const dispatch = useAppDispatch();
    const { currentPage, perPage, searchQuery } = useAppSelector((state) => state.pagination);
    const apiPage = currentPage + 1;

    const {
        data: labsData,
        isLoading,
        error,
    } = useGetLabsQuery({
        page: apiPage,
        perPage,
        search: searchQuery,
    });

    const setPage = (page: number) => {
        dispatch(paginationActions.setPage(page));
    };

    const nextPage = () => {
        dispatch(paginationActions.nextPage());
    };

    const prevPage = () => {
        dispatch(paginationActions.prevPage());
    };

    const setSearchQuery = useCallback((query:string) => {
        dispatch(paginationActions.setSearchQuery(query));
    }, [dispatch]);
    const clearSearch = useCallback((query:string) => {
        dispatch(paginationActions.clearSearch());
    }, [dispatch]);
    return {
        labs: labsData?.items || [],
        isLoading,
        error: error ? 'Ошибка загрузки лабораторных работ' : undefined,
        currentPage,
        perPage,
        total: labsData?.meta?.total || 0,
        totalPages: labsData?.meta?.total || 0,
        meta: labsData?.meta || null,
        setPage,
        nextPage,
        prevPage,
        setSearchQuery,
        clearSearch,
    };
};

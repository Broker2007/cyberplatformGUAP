import { useGetLabsQuery } from 'entities/labs/api/labsApi';
import { paginationActions } from 'features/pagination';
import { useCallback } from 'react';
import { useAppDispatch } from 'shared/lib/hooks/useAppDispatch';
import { useAppSelector } from 'shared/lib/hooks/useAppSelector';

const SCOPE = 'labs';

export const useLabs = () => {
    const dispatch = useAppDispatch();

    const { currentPage, perPage, searchQuery } = useAppSelector((state) => state.pagination[SCOPE]);

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

    const labs = labsData?.items || [];

    const total = labsData?.meta?.total || 0;

    const totalPages = Math.ceil(total / perPage);

    const setPage = useCallback((page: number) => {
        dispatch(paginationActions.setPage({ page, scope: SCOPE }));
    }, [dispatch]);

    const nextPage = useCallback(() => {
        dispatch(paginationActions.nextPage({ scope: SCOPE }));
    }, [dispatch]);

    const prevPage = useCallback(() => {
        dispatch(paginationActions.prevPage({ scope: SCOPE }));
    }, [dispatch]);

    const setSearchQuery = useCallback((query: string) => {
        dispatch(paginationActions.setSearchQuery({ query, scope: SCOPE }));
    }, [dispatch]);

    const clearSearch = useCallback(() => {
        dispatch(paginationActions.setSearchQuery({ query: '', scope: SCOPE }));
        dispatch(paginationActions.setPage({ page: 0, scope: SCOPE }));
    }, [dispatch]);

    return {
        labs,
        isLoading,
        error: error ? 'Ошибка загрузки лабораторных работ' : undefined,

        currentPage,
        perPage,

        total,
        totalPages,
        meta: labsData?.meta || null,

        setPage,
        nextPage,
        prevPage,
        setSearchQuery,
        clearSearch,
    };
};

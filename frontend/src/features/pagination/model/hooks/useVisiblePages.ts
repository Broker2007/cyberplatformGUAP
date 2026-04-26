import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { StateSchema } from 'app/providers/StoreProvider';

export const useVisiblePages = (scope: string = 'labs') => {
    const pagination = useSelector(
        (state: StateSchema) => state.pagination[scope],
    );

    const safePagination = pagination || {
        currentPage: 0,
        totalPages: 0,
    };

    const { currentPage, totalPages } = safePagination;

    const visiblePages = useMemo(() => {
        const VISIBLE = 5;

        if (totalPages <= 1) return [];

        if (totalPages <= VISIBLE) {
            return Array.from({ length: totalPages }, (_, i) => i);
        }

        let start = Math.max(0, currentPage - 2);
        let end = start + VISIBLE - 1;

        if (end >= totalPages) {
            end = totalPages - 1;
            start = Math.max(0, end - VISIBLE + 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }, [currentPage, totalPages]);

    return {
        visiblePages,
        currentPage,
        totalPages,
        hasPrevPage: currentPage > 0,
        hasNextPage: currentPage < totalPages - 1,
        showStartEllipsis: visiblePages[0] > 0,
        showEndEllipsis: visiblePages[visiblePages.length - 1] < totalPages - 1,
    };
};

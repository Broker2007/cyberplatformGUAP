import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { StateSchema } from 'app/providers/StoreProvider';

export const useVisiblePages = () => {
    const { currentPage, totalPages } = useSelector(
        (state: StateSchema) => state.pagination,
    );

    const VISIBLE_PAGES_COUNT = 5;

    const visiblePages = useMemo(() => {
        if (totalPages <= 1) {
            return [];
        }

        if (totalPages <= VISIBLE_PAGES_COUNT) {
            return Array.from({ length: totalPages }, (_, i) => i);
        }

        let startPage = Math.max(0, currentPage - Math.floor(VISIBLE_PAGES_COUNT / 2));
        let endPage = startPage + VISIBLE_PAGES_COUNT - 1;

        if (endPage >= totalPages) {
            endPage = totalPages - 1;
            startPage = Math.max(0, endPage - VISIBLE_PAGES_COUNT + 1);
        }

        const pages: number[] = [];
        for (let i = startPage; i <= endPage; i += 1) {
            pages.push(i);
        }

        return pages;
    }, [currentPage, totalPages]);

    return useMemo(() => ({
        visiblePages,
        currentPage,
        totalPages,
        hasPrevPage: currentPage > 0,
        hasNextPage: currentPage < totalPages - 1,
        showStartEllipsis: visiblePages.length > 0 && visiblePages[0] > 0,
        showEndEllipsis: visiblePages.length > 0 && visiblePages[visiblePages.length - 1] < totalPages - 1,
    }), [visiblePages, currentPage, totalPages]);
};

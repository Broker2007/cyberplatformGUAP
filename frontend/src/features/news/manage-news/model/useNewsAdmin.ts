import { useGetNewsQuery } from 'entities/news/api/newsApi';
import { useAppSelector } from 'shared/lib/hooks/useAppSelector';
import { useAppDispatch } from 'shared/lib/hooks/useAppDispatch';
import { paginationActions } from 'features/pagination';

const SCOPE = 'newsAdmin';

export const useNewsAdmin = () => {
    const dispatch = useAppDispatch();

    const pagination = useAppSelector((state) => state.pagination[SCOPE]);
    const currentPage = pagination?.currentPage ?? 0;
    const perPage = pagination?.perPage ?? 6;

    const apiPage = currentPage + 1;

    const { data, isLoading, isError } = useGetNewsQuery({
        page: apiPage,
        perPage,
        scope: SCOPE,
    });

    const setPage = (page: number) => {
        dispatch(paginationActions.setPage({ page, scope: SCOPE }));
    };

    return {
        news: data?.items || [],
        isLoading,
        isError,
        setPage,
    };
};

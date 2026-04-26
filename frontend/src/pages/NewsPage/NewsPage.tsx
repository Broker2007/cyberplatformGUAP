import { useGetNewsQuery } from 'entities/news/api/newsApi';
import NewsItem from 'entities/news/ui/NewsItem/NewsItem';
import { useAppSelector } from 'shared/lib/hooks/useAppSelector';
import { useAppDispatch } from 'shared/lib/hooks/useAppDispatch';
import { Pagination, paginationActions } from 'features/pagination';
import { useCallback } from 'react';
import cls from './NewsPage.module.scss';

const SCOPE = 'news';

const NewsPage = () => {
    const dispatch = useAppDispatch();

    // 🔥 безопасный доступ
    const pagination = useAppSelector(
        (state) => state.pagination[SCOPE],
    );

    const currentPage = pagination?.currentPage ?? 0;
    const perPage = pagination?.perPage || 6;
    const totalPages = pagination?.totalPages ?? 0;

    const apiPage = currentPage + 1;

    const { data, isLoading, error } = useGetNewsQuery({
        page: apiPage,
        perPage: perPage || 6,
        scope: SCOPE,
    });

    const handlePageChange = useCallback((page: number) => {
        dispatch(paginationActions.setPage({ page, scope: SCOPE }));
    }, [dispatch]);

    const news = data?.items || [];

    // 🔥 состояния
    if (isLoading && news.length === 0) {
        return <div className={cls.loader}>Загрузка...</div>;
    }

    if (error) {
        return <div className={cls.error}>Ошибка загрузки новостей</div>;
    }

    return (
        <div className={cls.NewsPage}>
            <div className={cls.container}>

                <div className={cls.title_news}>
                    <h1 className={cls.title_text}>Новости</h1>
                </div>

                <div className={cls.news_list}>
                    {news.length === 0 && (
                        <div className={cls.empty}>Новостей пока нет</div>
                    )}

                    {news.map((item) => (
                        <NewsItem key={item.id} newsItems={item} />
                    ))}
                </div>

                {/* 🔥 правильная пагинация */}
                {totalPages > 1 && (
                    <div className={cls.pagination}>
                        <Pagination
                            scope={SCOPE}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}

            </div>
        </div>
    );
};

export default NewsPage;

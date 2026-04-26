import { Pagination } from 'features/pagination';
import { useDeleteNewsMutation } from 'entities/news/api/newsApi';
import { useNewsAdmin } from '../model/useNewsAdmin';
import cls from './NewsAdminBlock.module.scss';

export const NewsAdminBlock = () => {
    const {
        news, isLoading, isError, setPage,
    } = useNewsAdmin();
    const [deleteNews, { isLoading: isDeleting }] = useDeleteNewsMutation();

    const handleDelete = async (id: string) => {
        try {
            await deleteNews(id).unwrap();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className={cls.block}>
            {isLoading && (
                <div className={cls.loading}>Загрузка списка…</div>
            )}

            {isError && !isLoading && (
                <div className={cls.errorBanner}>
                    Не удалось загрузить новости. Обновите страницу.
                </div>
            )}

            <div className={cls.list}>
                {!isLoading && !isError && news.length === 0 && (
                    <div className={cls.empty}>Публикаций пока нет</div>
                )}

                {news.map((item) => (
                    <div key={item.id} className={cls.item}>
                        <div className={cls.content}>
                            <div className={cls.itemTitle}>{item.title}</div>
                            <div className={cls.itemDesc}>{item.content}</div>
                        </div>

                        <button
                            type="button"
                            className={cls.deleteBtn}
                            onClick={() => handleDelete(item.id)}
                            disabled={isDeleting}
                        >
                            Удалить
                        </button>
                    </div>
                ))}
            </div>

            <div className={cls.paginationWrap}>
                <Pagination
                    scope="newsAdmin"
                    onPageChange={setPage}
                />
            </div>
        </div>
    );
};

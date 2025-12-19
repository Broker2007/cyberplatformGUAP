import { classNames } from 'shared/lib/classNames/classNames';
import InputSearch from 'shared/ui/InputSearch/InputSearch';
import LabItem from 'shared/ui/LabItem/LabItem';
import { PageLoader } from 'shared/ui/PageLoader/PageLoader';
import { useAppSelector } from 'shared/lib/hooks/useAppSelector';
import { useGetLabsQuery } from 'entities/labs/api/labsApi';
import { Pagination, paginationActions, useDebounce } from 'features/pagination';
import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from 'shared/lib/hooks/useAppDispatch';
import cls from './LabTemplatesPage.module.scss';

const LabTemplatesPage = () => {
    const dispatch = useAppDispatch();
    const { currentPage, perPage, searchQuery } = useAppSelector((state) => state.pagination);
    const [isChangingPage, setIsChangingPage] = useState(false);

    const [localSearchValue, setLocalSearchValue] = useState(searchQuery || '');

    const debouncedSearchValue = useDebounce(localSearchValue, 750);

    const apiPage = currentPage + 1;

    const {
        data: labsData,
        isLoading,
        error,
        refetch,
        isFetching,
    } = useGetLabsQuery({
        page: apiPage,
        perPage,
        search: debouncedSearchValue,
    });

    const labs = labsData?.items || [];

    useEffect(() => {
        setLocalSearchValue(searchQuery || '');
    }, [searchQuery]);

    const handleSearchChange = useCallback((value: string) => {
        setLocalSearchValue(value);
    }, []);

    const handleClearSearch = useCallback(() => {
        setLocalSearchValue('');
        dispatch(paginationActions.setSearchQuery(''));
        dispatch(paginationActions.setPage(0));
    }, [dispatch]);

    useEffect(() => {
        if (debouncedSearchValue !== searchQuery) {
            dispatch(paginationActions.setSearchQuery(debouncedSearchValue));
            dispatch(paginationActions.setPage(0));
            refetch();
        }
    }, [debouncedSearchValue, searchQuery, dispatch, refetch]);

    useEffect(() => {
        if (isFetching) {
            setIsChangingPage(true);
            return undefined;
        }
        const timer = setTimeout(() => {
            setIsChangingPage(false);
        }, 100);
        return () => clearTimeout(timer);
    }, [isFetching]);

    const handleRetry = () => {
        refetch();
    };

    const handlePageChange = useCallback((page: number) => {
        dispatch(paginationActions.setPage(page));
    }, [dispatch]);

    const renderContent = () => {
        if (isChangingPage) {
            return (
                <div className="d-f jc-cen ai-cen w-100 h-100">
                    <PageLoader />
                </div>
            );
        }

        if (labs.length === 0) {
            const isSearching = debouncedSearchValue.length > 0;
            return (
                <div className={cls.emptyState}>
                    <h3>
                        {isSearching
                            ? 'Лабораторные работы не найдены'
                            : 'Нет доступных лабораторных работ'}
                    </h3>
                    <p>
                        {isSearching
                            ? 'Попробуйте изменить параметры поиска'
                            : 'В данный момент нет доступных лабораторных работ'}
                    </p>
                </div>
            );
        }

        return (
            <div className={classNames(cls.block_labs, {}, [])}>
                {labs.map((lab) => (
                    <LabItem
                        className="pr-15"
                        key={lab.id}
                        id={lab.id}
                        difficulty={lab.difficulty}
                        tags={lab.tags}
                        status="Решена"
                        title={lab.name}
                        description={lab.description}
                    />
                ))}
            </div>
        );
    };

    if (isLoading && labs.length === 0) {
        return (
            <div className="d-f jc-cen ai-cen w-100 h-100">
                <PageLoader />
            </div>
        );
    }

    if (error) {
        return (
            <div className={cls.error}>
                <h3>Ошибка загрузки</h3>
                <p>Ошибка загрузки лабораторных работ</p>
                <button
                    type="button"
                    onClick={handleRetry}
                    className={cls.retryButton}
                >
                    Попробовать снова
                </button>
            </div>
        );
    }

    return (
        <div className={classNames(cls.pageWrapper, {}, [])}>
            <div className={classNames(cls.container, {}, [])}>
                <div className={cls.searchSection}>
                    <InputSearch
                        placeholder="Найти задание"
                        className="w-100"
                        value={localSearchValue}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className={cls.contentSection}>
                    {renderContent()}
                </div>

                {labs.length > 0 && labsData && (
                    <div className={cls.paginationSection}>
                        <Pagination
                            className={cls.paginationWrapper}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default LabTemplatesPage;

import React, {
    useState, useEffect, useCallback, useLayoutEffect, memo
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StateSchema } from 'app/providers/StoreProvider';
import { Button } from 'shared/ui/Button/Button';
import { ThemeButton } from 'shared/ui/Button/ThemeButton';
import ArrowLeftIcon from 'shared/assets/icons/arrow_left.svg';
import ArrowRightIcon from 'shared/assets/icons/arrow_right.svg';
import { classNames } from 'shared/lib/classNames/classNames';
import { useVisiblePages } from '../model/hooks/useVisiblePages';
import { paginationActions } from '../model/slice/paginationSlice';
import cls from './Pagination.module.scss';

interface PaginationProps {
    className?: string;
    onPageChange?: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = memo((props:PaginationProps) => {
    const {
        className,
        onPageChange,
    } = props;
    const dispatch = useDispatch();
    const { perPage } = useSelector((state: StateSchema) => state.pagination);
    const {
        visiblePages,
        currentPage,
        totalPages,
        hasPrevPage,
        hasNextPage,
        showStartEllipsis,
        showEndEllipsis,
    } = useVisiblePages();

    const [activePosition, setActivePosition] = useState({ left: 0, width: 0 });
    const [isAnimating, setIsAnimating] = useState(false);

    const buttonRefs = React.useRef<Map<number, HTMLButtonElement>>(new Map());

    const setButtonRef = useCallback((page: number) => (el: HTMLButtonElement | null) => {
        if (el) {
            buttonRefs.current.set(page, el);
        } else {
            buttonRefs.current.delete(page);
        }
    }, []);

    useLayoutEffect(() => {
        requestAnimationFrame(() => {
            const activeButton = buttonRefs.current.get(currentPage);
            if (activeButton) {
                const { offsetLeft, offsetWidth } = activeButton;
                setActivePosition({ left: offsetLeft, width: offsetWidth });
            }
        });
    }, [currentPage, visiblePages]);

    const handlePageClick = useCallback((page: number) => {
        setIsAnimating(true);
        dispatch(paginationActions.setPage(page));
        onPageChange?.(page);

        setTimeout(() => setIsAnimating(false), 300);
    }, [dispatch, onPageChange]);

    const handlePrevClick = useCallback(() => {
        if (hasPrevPage) {
            setIsAnimating(true);
            dispatch(paginationActions.prevPage());
            onPageChange?.(currentPage - 1);
            setTimeout(() => setIsAnimating(false), 300);
        }
    }, [dispatch, onPageChange, hasPrevPage, currentPage]);

    const handleNextClick = useCallback(() => {
        if (hasNextPage) {
            setIsAnimating(true);
            dispatch(paginationActions.nextPage());
            onPageChange?.(currentPage + 1);
            setTimeout(() => setIsAnimating(false), 300);
        }
    }, [dispatch, onPageChange, hasNextPage, currentPage]);

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className={classNames(cls.navigation, {}, [className])}>
            <Button
                type="button"
                theme={ThemeButton.PAGIN_ARROW}
                className={cls.button_arrow}
                onClick={handlePrevClick}
                disabled={!hasPrevPage}
                title="Предыдущая страница"
            >
                <ArrowLeftIcon className={cls.navIcon} />
            </Button>

            <div className={cls.pagination_number}>
                {showStartEllipsis && (
                    <span className={cls.ellipsis}>...</span>
                )}

                <div
                    className={classNames(cls.activeBackground, {
                        [cls.animating]: isAnimating,
                    })}
                    style={{
                        left: `${activePosition.left}px`,
                        width: `${activePosition.width}px`,
                    }}
                />

                {visiblePages.map((page) => (
                    <Button
                        key={page}
                        ref={setButtonRef(page)}
                        theme={ThemeButton.PAGIN_PAGE}
                        className={classNames(cls.pageButton, {
                            [cls.pageButtonActive]: page === currentPage,
                        })}
                        onClick={() => handlePageClick(page)}
                        aria-current={page === currentPage ? 'page' : undefined}
                        title={`Перейти на страницу ${page + 1}`}
                    >
                        {page + 1}
                    </Button>
                ))}

                {showEndEllipsis && (
                    <span className={cls.ellipsis}>...</span>
                )}
            </div>

            <Button
                type="button"
                theme={ThemeButton.PAGIN_ARROW}
                className={cls.button_arrow}
                onClick={handleNextClick}
                disabled={!hasNextPage}
                title="Следующая страница"
            >
                <ArrowRightIcon className={cls.navIcon} />
            </Button>
        </div>
    );
});

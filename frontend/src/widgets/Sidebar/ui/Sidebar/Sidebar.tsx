import { classNames } from 'shared/lib/classNames/classNames';
import { Button } from 'shared/ui/Button/Button';
import { ThemeButton } from 'shared/ui/Button/ThemeButton';
import Logo from 'shared/assets/icons/logo.svg';
import { SideBarItemsList } from 'widgets/Sidebar/model/items';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import GoBack from 'shared/assets/icons/arrow_back.svg';
import cls from './Sidebar.module.scss';
import SideBarItem from '../SideBarItem/SideBarItem';

interface SidebarProps {
    className?: string;
    collapsed: boolean;
    setCollapsed: (arg: boolean) => void;
}

export const Sidebar = ({ className, collapsed, setCollapsed }: SidebarProps) => {
    const onOpen = () => {
        setCollapsed(false);
    };

    const onClose = () => {
        setCollapsed(true);
    };

    useEffect(() => {
        const { body } = document;

        if (!collapsed) {
            // Добавляем класс для блокировки скролла и затемнения
            body.classList.add('sidebar-open');
        } else {
            // Убираем класс блокировки
            body.classList.remove('sidebar-open');
        }

        return () => {
            // Cleanup при размонтировании
            body.classList.remove('sidebar-open');
        };
    }, [collapsed]);

    const handleBackdropClick = (event: React.MouseEvent) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    const itemsList = SideBarItemsList.map((item) => (
        <SideBarItem
            onClose={onClose}
            item={item}
            key={item.path}
        />
    ));

    return (
        <>
            <div
                onClick={onOpen}
                className={classNames(cls.btn_collapsed, { [cls.close]: !collapsed }, [])}
            >
                ☰
            </div>

            <div
                onClick={handleBackdropClick}
                className={classNames(
                    cls.main_block,
                    { [cls.hidden]: collapsed },
                    [],
                )}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className={classNames(
                        cls.sidebar,
                        { [cls.collapsed]: collapsed },
                        [],
                    )}
                >
                    <div className={cls.sidebar_content}>
                        <div className={cls.header}>
                            <Logo className={cls.logo} />
                            <Button
                                type="button"
                                onClick={onClose}
                                theme={ThemeButton.CLOSE}
                            >
                                <GoBack className={cls.goback} />
                            </Button>
                        </div>
                        <div className={cls.nav_list}>
                            {itemsList}
                        </div>
                        <div className={cls.block_partners}>
                            <div className={cls.partners}>
                                <p className={cls.title}>Партнеры</p>
                                <p className={cls.filling}>ГУАП</p>
                            </div>
                        </div>
                        <div className={cls.block_partners}>
                            <div className={cls.partners}>
                                <p className={cls.title}>Социальные сети</p>
                                <Link to="/" className={cls.filling_media}><p>ВКонтакте</p></Link>
                                <Link to="/" className={cls.filling_media}><p>Telegram</p></Link>
                                <Link to="/" className={cls.filling_media}><p>Instagram</p></Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

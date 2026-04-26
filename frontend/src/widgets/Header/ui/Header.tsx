import { classNames } from 'shared/lib/classNames/classNames';
import { Sidebar } from 'widgets/Sidebar';
import { Button } from 'shared/ui/Button/Button';
import Logo from 'shared/assets/icons/logo.svg';
import Notification from 'shared/assets/icons/notification.svg';
import Profile from 'shared/assets/icons/profile.svg';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ThemeButton } from 'shared/ui/Button/ThemeButton';
import { useGetMeQuery } from 'entities/user/api/userApi';
import cls from './Header.module.scss';

interface NavbarProps {
    className?: string;
}

export const Header = ({ className }: NavbarProps) => {
    const [collapsed, setCollapsed] = useState(true);
    const { data: user } = useGetMeQuery();

    // Получаем URL аватара из данных пользователя
    const avatarUrl = user?.avatar;

    return (
        <div className={classNames(cls.Navbar, {}, [className, 'container'])}>
            <div className={cls.sidebar}>
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
                <Link to="/" className={classNames(cls.block_logo, {}, [])}>
                    <Logo className={cls.link_logo} />
                    <p className={classNames(cls.text_logo, { [cls.margin_left]: !collapsed }, [])}>Киберполигон</p>
                </Link>
            </div>
            <div className={classNames(cls.actions, {}, [])}>
                {user?.role === true && (
                    <Link to="/admin" className={cls.link}>
                        <Button theme={ThemeButton.VISIT}>
                            Админка
                        </Button>
                    </Link>
                )}

                <Link to="/" className={cls.link}>
                    <Notification />
                </Link>
                <Link
                    to="/profile"
                    className={classNames(cls.profile, {}, [cls.link])}
                >
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            className={cls.profile}
                            alt="Аватар"
                        />
                    ) : null}
                    <Profile
                        className={`profile-default-icon ${cls.profile_icon}`}
                        style={{ display: avatarUrl ? 'none' : 'block' }}
                    />
                </Link>
            </div>
        </div>
    );
};

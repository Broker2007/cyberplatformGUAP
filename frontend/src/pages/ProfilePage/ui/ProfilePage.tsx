import { classNames } from 'shared/lib/classNames/classNames';
import AvatarIcon from 'shared/assets/icons/profile.svg';
import ExclamationIcon from 'shared/assets/icons/exclamation2.svg';
import { PageLoader } from 'shared/ui/PageLoader/PageLoader';
import { useNavigate } from 'react-router-dom';
import { Button } from 'shared/ui/Button/Button';
import { ThemeButton } from 'shared/ui/Button/ThemeButton';
import { useGetMeQuery } from 'entities/user/api/userApi';
import { useLogout } from 'entities/user';
import ArrowExitIcon from 'shared/assets/icons/exit.svg';
import { useState } from 'react';
import { ImageUploadModal } from 'features/image-upload';
import { useLogoutAllDevicesMutation } from 'features/auth/api/authApi';
import cls from './ProfilePage.module.scss';

interface ProfilePageProps {
    className?: string,
}

const ProfilePage = ({ className }: ProfilePageProps) => {
    const {
        data: user,
        isLoading,
        isError,
    } = useGetMeQuery(undefined, {
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });

    const navigate = useNavigate();
    const { logout } = useLogout();
    const [isAvatarModal, setIsAvatarModal] = useState(false);
    const [logoutAllDevices, { isLoading: isLogoutAllLoading }] = useLogoutAllDevicesMutation();

    const handleLogout = async () => {
        if (window.confirm('Вы уверены, что хотите выйти?')) {
            await logout();
        }
    };

    const handleLogoutAll = async () => {
        if (window.confirm('Выйти со всех устройств?')) {
            try {
                await logoutAllDevices().unwrap();
            } catch (error) {
                console.error('Logout all failed', error);
            } finally {
                await logout();
            }
        }
    };

    // Загрузка состояния
    if (isLoading) {
        return (
            <div className="d-f jc-cen ai-cen h-100 w-100">
                <PageLoader />
            </div>
        );
    }

    // Ошибка загрузки пользователя
    if (isError) {
        return (
            <div className={cls.error}>
                <h2>Ошибка загрузки</h2>
                <p>Не удалось загрузить данные пользователя</p>
                <button type="button" onClick={() => navigate('/login')} className={cls.backButton}>
                    Вернуться
                </button>
            </div>
        );
    }

    // Пользователь не найден
    if (!user) {
        return (
            <div className={cls.notFound}>
                <h2>Пользователь не найден</h2>
                <button type="button" onClick={() => navigate('/login')} className={cls.backButton}>
                    Вернуться
                </button>
            </div>
        );
    }

    // Получаем URL аватара из данных пользователя
    const avatarUrl = user.avatar;

    return (
        <div className={classNames(cls.ProfilePage, {}, [className])}>
            <div className={cls.main_block}>
                {/* Блок профиля */}
                <div className={cls.profile}>
                    <div className={cls.logoutButtons}>
                        <Button
                            theme={ThemeButton.INLINE}
                            className={cls.btn_exit}
                            onClick={handleLogout}
                        >
                            <p className={cls.text_arrow_btn}>Выйти</p>
                            <ArrowExitIcon className={cls.arrow_icon} />
                        </Button>

                        <Button
                            theme={ThemeButton.INLINE}
                            className={cls.btn_exit_all}
                            onClick={handleLogoutAll}
                            disabled={isLogoutAllLoading}
                        >
                            <p className={cls.text_arrow_btn}>Выйти со всех устройств</p>
                        </Button>
                    </div>
                    <div
                        className={cls.avatarWrapper}
                        onClick={() => setIsAvatarModal(true)}
                    >
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                className={cls.avatar}
                                alt="avatar"
                                onError={(e) => {
                                    // Если аватар не загрузился, показываем дефолтную иконку
                                    e.currentTarget.style.display = 'none';
                                    const defaultIcon = e.currentTarget.parentElement?.querySelector('.default-avatar-icon');
                                    if (defaultIcon) {
                                        (defaultIcon as HTMLElement).style.display = 'block';
                                    }
                                }}
                            />
                        ) : null}
                        <AvatarIcon
                            className={`${cls.icon_avatar} default-avatar-icon`}
                            style={{ display: avatarUrl ? 'none' : 'block' }}
                        />
                    </div>

                    <div>
                        <p className={cls.head_title}>{user.fullName}</p>
                        <div className={cls.head_profil}>
                            <ExclamationIcon className={cls.icon_exclamation} />
                            <p className={cls.username}>
                                id:
                                {user.id}
                            </p>
                        </div>
                        <div className={cls.block_desc_profile}>
                            <div className={cls.item_desc_profile}>
                                <p className={cls.desc_profil_title}>Роль</p>
                                <p className={cls.desc_profil}>
                                    {user.role ? 'Админ' : 'Студент'}
                                </p>
                            </div>
                            <div className={cls.item_desc_profile}>
                                <p className={cls.desc_profil_title}>Почта</p>
                                <p className={cls.desc_profil}>{user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <ImageUploadModal
                    isOpen={isAvatarModal}
                    onClose={() => setIsAvatarModal(false)}
                />
                {/* Блок с отчетом по лабораторной работе */}

            </div>
        </div>
    );
};

export default ProfilePage;

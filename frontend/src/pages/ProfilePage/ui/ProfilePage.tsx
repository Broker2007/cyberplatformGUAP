import { classNames } from 'shared/lib/classNames/classNames';
import LabItemProfile from 'shared/ui/LabItemProfile/LabItemProfile';
import AvatarIcon from 'shared/assets/icons/example_avatar_user.svg';
import ExclamationIcon from 'shared/assets/icons/exclamation2.svg';
import { PageLoader } from 'shared/ui/PageLoader/PageLoader';
import { useNavigate } from 'react-router-dom';
import { Button } from 'shared/ui/Button/Button';
import { ThemeButton } from 'shared/ui/Button/ThemeButton';
import { useGetMeQuery } from 'entities/user/api/userApi';
import { useLogout } from 'entities/user';
import ArrowExitIcon from 'shared/assets/icons/exit.svg';
import { useGetLabsQuery } from 'entities/labs/api/labsApi';
import cls from './ProfilePage.module.scss';

interface ProfilePageProps {
    className?: string,
}

const ProfilePage = ({ className }:ProfilePageProps) => {
    const { data: user, isLoading, isError } = useGetMeQuery();
    const navigate = useNavigate();
    const { logout } = useLogout();

    // const { data: labsData, isLoading: labsLoading, isError: labsError } = useGetLabsQuery({
    //     page: 0,
    //     perPage: 9,
    //     search: '',
    // });

    // const labs = labsData?.items || [];
    const handleLogout = () => {
        if (window.confirm('Вы уверены, что хотите выйти?')) {
            logout();
        }
    };
    if (isLoading) {
        return (
            <div className="d-f jc-cen ai-cen h-100 w-100">
                <PageLoader />
            </div>
        );
    }

    if (isError) {
        return (
            <div className={cls.error}>
                <h2>Ошибка загрузки</h2>
                <p>{isError}</p>
                <button type="button" onClick={() => navigate('/login')} className={cls.backButton}>
                    Вернуться
                </button>
            </div>
        );
    }

    if (!isLoading && !user) {
        return (
            <div className={cls.notFound}>
                <h2>Пользователь не найден</h2>
                <button type="button" onClick={() => navigate('/login')} className={cls.backButton}>
                    Вернуться
                </button>
            </div>
        );
    }
    if (!user) {
        return (<PageLoader />);
    }
    return (
        <div className={classNames(cls.ProfilePage, {}, [className])}>
            <div className={cls.main_block}>
                <div className={cls.profile}>
                    <Button
                        theme={ThemeButton.INLINE}
                        className={cls.btn_exit}
                        onClick={handleLogout}
                    >
                        <p className={cls.text_arrow_btn}>Выйти</p>
                        <ArrowExitIcon className={cls.arrow_icon} />
                    </Button>
                    <AvatarIcon className={cls.icon_avatar} />
                    <div>
                        <p className={cls.head_title}>{user.fullName}</p>
                        <div className={cls.head_profil}>
                            <ExclamationIcon className={cls.icon_exclamation} />
                            <p className={cls.username}>@director_sartir</p>
                        </div>
                        <div className={cls.block_desc_profile}>
                            <div className={cls.item_desc_profile}>
                                <p className={cls.desc_profil_title}>Роль</p>
                                <p className={cls.desc_profil}>{user.role}</p>
                            </div>
                            <div className={cls.item_desc_profile}>
                                <p className={cls.desc_profil_title}>Почта</p>
                                <p className={cls.desc_profil}>{user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={cls.block_search}>
                    <div className={cls.title_labs}>
                        <p>Отчёты</p>
                        <p className={cls.dot}>•</p>
                        <p className={cls.lab_text}>Лабораторные работы</p>
                    </div>
                </div>
                {/* <div className={cls.block_labs}>
                    {labsLoading && <p>Загрузка...</p>}
                    {labsError && <p>Ошибка загрузки лабораторных...</p>}
                    {labs.length === 0 && <p>Кажется у вас нет лаб...</p>}
                    {labs.map((lab) => (
                        <LabItemProfile
                            key={lab.id}
                            id={lab.id}
                            title={lab.name}
                            status="решена"
                            teacher="имя учителя"
                            date="дата лабы"
                        />
                    ))}
                </div> */}
            </div>
        </div>
    );
};
export default ProfilePage;

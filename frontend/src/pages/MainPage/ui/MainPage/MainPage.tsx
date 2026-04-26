import LogoIcon from 'shared/assets/icons/logo.svg';
import ShieldIcon from 'shared/assets/icons/teams/shield.svg';
import AttackIcon from 'shared/assets/icons/teams/attack.svg';
import SkillIcon from 'shared/assets/icons/teams/skill.svg';
import TeacherIcon from 'shared/assets/icons/teams/teacher.svg';
import TeamsIcon from 'shared/assets/icons/teams/teams.svg';
import { classNames } from 'shared/lib/classNames/classNames';
import { Link } from 'react-router-dom';
import { useGetMeQuery } from 'entities/user/api/userApi';
import NewsPage from 'pages/NewsPage/NewsPage';
import { Header } from 'widgets/Header';
import { PageLoader } from 'shared/ui/PageLoader/PageLoader';
import cls from './MainPage.module.scss';

const MainPage = () => {
    const hasAccessToken = Boolean(
        typeof window !== 'undefined' && localStorage.getItem('accessToken'),
    );

    const { data: user, isLoading } = useGetMeQuery(undefined, {
        skip: !hasAccessToken,
    });

    if (hasAccessToken && isLoading) {
        return (
            <div className={cls.authPending}>
                <PageLoader />
            </div>
        );
    }

    if (user) {
        return (
            <>
                <Header />
                <NewsPage />
            </>

        );
    }
    return (
        <div className={cls.MainPage}>
            <div className={cls.content}>
                <div className={cls.head_block}>
                    <div className={cls.block_logo}>
                        <LogoIcon className={cls.main_logo} />
                    </div>
                    <p className={cls.main_text}>Испытай себя с разных сторон</p>
                    <div className={cls.second_text}>
                        <p>
                            Мы даем вам возможность практиковать
                            задания по кибербезопасности
                        </p>
                    </div>
                    <div className={cls.cards_block}>
                        <div className={classNames(cls.card_item, {}, [cls.blue_team])}>
                            <div className={cls.title_block_card}>
                                <TeamsIcon className={cls.teams_icon} />
                                <p className={cls.title_text}>Blue Team</p>
                            </div>
                            <div className={cls.second_block}>
                                <div className={cls.li_block}>
                                    <ShieldIcon className={cls.icon_li} />
                                    <span className={cls.text_li}>Практика в защите</span>
                                </div>
                                <div className={cls.li_block}>
                                    <SkillIcon className={cls.icon_li} />
                                    <span className={cls.text_li}>Настоящий опыт</span>
                                </div>
                                <div className={cls.li_block}>
                                    <TeacherIcon className={cls.icon_li} />
                                    <span className={cls.text_li}>Наставник </span>
                                </div>
                            </div>
                        </div>
                        <div className={classNames(cls.card_item, {}, [cls.red_team])}>
                            <div className={cls.title_block_card}>
                                <TeamsIcon className={cls.teams_icon} />
                                <p className={cls.title_text}>Red Team</p>
                            </div>
                            <div className={cls.second_block}>
                                <div className={cls.li_block}>
                                    <AttackIcon className={cls.icon_li} />
                                    <span className={cls.text_li}>Практика в атаке</span>
                                </div>
                                <div className={cls.li_block}>
                                    <SkillIcon className={cls.icon_li} />
                                    <span className={cls.text_li}>Настоящий опыт</span>
                                </div>
                                <div className={cls.li_block}>
                                    <TeacherIcon className={cls.icon_li} />
                                    <span className={cls.text_li}>Наставник </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={cls.btn_block}>
                        <div className={cls.width}>
                            <Link className={cls.btn_log_in} to="/login">Вход</Link>
                            <Link className={cls.btn_reg} to="/register">Регистрация</Link>

                        </div>

                    </div>

                </div>
                <div className={cls.polit_block}>
                    <span className={cls.line} />
                    <div className="d-f jc-cen ai-cen">
                        <p className={cls.text_polit}>
                            Нажимая «Регистрация» и «Вход», вы принимаете
                            пользовательское соглашение и политику
                            конфиденциальности
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;

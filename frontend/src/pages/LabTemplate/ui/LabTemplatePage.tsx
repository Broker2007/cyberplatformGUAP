import { classNames } from 'shared/lib/classNames/classNames';
import { Button } from 'shared/ui/Button/Button';
import ArrowExitIcon from 'shared/assets/icons/arrow_exit.svg';
import CloseIcon from 'shared/assets/icons/close.svg';
import RevealIcon from 'shared/assets/icons/reveal.svg';
import ExclamationIcon from 'shared/assets/icons/exclamation.svg';
import BugIcon from 'shared/assets/icons/bug.svg';
import { ThemeButton } from 'shared/ui/Button/ThemeButton';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageLoader } from 'shared/ui/PageLoader/PageLoader';
import { useGetLabByIdQuery } from 'entities/labs/api/labsApi';
import cls from './LabTemplatePage.module.scss';
import { Loader } from 'shared/ui/Loader/Loader';

interface LabTemplateProps {
    className?: string,
}

const LabTemplatePage = ({ className }: LabTemplateProps) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {
        data: lab,
        isLoading,
        error,
        refetch,
    } = useGetLabByIdQuery(id || '', {
        skip: !id,
    });

    const handleRetry = () => {
        if (id) {
            refetch();
        }
    };

    if (isLoading) {
        return (
            <div className="d-f jc-cen ai-cen h-100 w-100">
                <PageLoader />
            </div>
        );
    }

    if (error) {
        return (
            <div className={cls.error}>
                <h2>Ошибка загрузки</h2>
                <p>Ошибка загрузки лабораторной работы</p>
                <button
                    type="button"
                    onClick={handleRetry}
                    className={cls.retryButton}
                >
                    Попробовать снова
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/labs_templates')}
                    className={cls.backButton}
                >
                    Вернуться к списку
                </button>
            </div>
        );
    }

    if (!lab && !isLoading) {
        return (
            <div className={cls.notFound}>
                <h2>Лабораторная работа не найдена</h2>
                <button
                    type="button"
                    onClick={() => navigate('/labs_templates')}
                    className={cls.backButton}
                >
                    Вернуться к списку
                </button>
            </div>
        );
    }

    if (!lab) {
        return <PageLoader />;
    }

    return (
        <div className={classNames(cls.LabTemplate, {}, [className])}>
            <div className={cls.container}>
                <div className={cls.left_block}>
                    <div className={cls.left_head}>
                        <div className={cls.btn_group1}>
                            <Button
                                theme={ThemeButton.INLINE}
                                className={cls.arrow_btn}
                                onClick={() => navigate('/labs_templates')}
                            >
                                <ArrowExitIcon className={cls.arrow_icon} />
                                <p className={cls.text_arrow_btn}>Вернуться</p>
                            </Button>
                            <span className={cls.stick} />
                            <Button
                                theme={ThemeButton.INLINE}
                                className={cls.close_btn}
                            >
                                <p className={cls.text_close_btn}>Завершить</p>
                                <CloseIcon className={cls.close_icon} />
                            </Button>
                        </div>
                        <div className={cls.btn_group2}>
                            <Button
                                theme={ThemeButton.INLINE}
                                className={cls.bug_btn}
                            >
                                <p className={cls.text_bug_btn}>Нашли баг</p>
                                <BugIcon className={cls.bug_icon} />
                            </Button>
                            <Button
                                theme={ThemeButton.CLEAR}
                                className={cls.reveal_btn}
                            >
                                <RevealIcon className={cls.reveal_icon} />
                            </Button>
                        </div>
                    </div>
                    <div className={cls.console}>
                        <Loader />
                    </div>
                </div>
                <div className={cls.right_block}>
                    <div className={cls.right_head}>
                        <ExclamationIcon className={cls.exclamation_icon} />
                        <p className={cls.exclamation_text}>Техническое задание</p>
                    </div>
                    <div className={cls.main_desc}>
                        <div className={cls.block_des1}>
                            <p className={cls.title1}>Описание</p>
                            <p className={cls.description1}>
                                {lab.description.overview}
                            </p>
                        </div>
                        <div className={cls.block_des2}>
                            <p className={cls.title2}>Цели</p>
                            <ul className={cls.description2}>
                                {lab.description.objectives.map((item, index) => (
                                    <li
                                        key={index}
                                        className={index === 0 ? 'ml-30' : 'mt-20 ml-30'}
                                    >
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className={cls.resources}>
                            <p className={cls.title2}>Ресурсы</p>
                            <div className={cls.resources_block}>
                                {lab.description.resources.map((item, index) => (
                                    <Link
                                        key={index}
                                        to={item.url}
                                        className={cls.resources_text}
                                    >
                                        {item.title}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LabTemplatePage;

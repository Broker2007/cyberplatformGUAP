import { classNames } from 'shared/lib/classNames/classNames';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'shared/ui/Button/Button';
import { ThemeButton } from 'shared/ui/Button/ThemeButton';
import BackIcon from 'shared/assets/icons/arrow_left2.svg';
import cls from './PagesErrors.module.scss';

interface PagesErrorsProps {
    className?:string;
    title:string;
    text:string;
    code:string | number;

}
export const PagesErrors = ({
    className,
    title,
    text,
    code,
}: PagesErrorsProps) => {
    const navigate = useNavigate();
    return (
        <div className={classNames(cls.PagesErrors, {}, [className])}>
            <Button
                theme={ThemeButton.INLINE}
                className={cls.back_btn}
                onClick={() => navigate('/')}
            >
                <BackIcon className={cls.arrow_icon} />
                <p className={cls.text_arrow_btn}>Назад</p>
            </Button>
            <div className={cls.CenterDiv}>
                <p className={cls.error_title}>{title}</p>
                <p className={cls.error_text}>{text}</p>
                <p className={cls.error_num}>{code}</p>
            </div>
        </div>
    );
};

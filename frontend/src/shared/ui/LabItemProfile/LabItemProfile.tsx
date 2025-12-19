import { classNames } from 'shared/lib/classNames/classNames';
import LabItemIcon from 'shared/assets/icons/labitem-profile.svg';
import cls from './LabItemProfile.module.scss';

interface LabItemProfileProps{
    className?: string,
    id: number|string;
    title: string,
    status: string,
    teacher: string,
    date: string,
}

const LabItemProfile = ({
    className, title, status, teacher, date, id, 
}:LabItemProfileProps) => {
    const a = 123;
    return (
        <div className={classNames(cls.LabItemProfile, {}, [className])}>
            <LabItemIcon />
            <div className={cls.left_block}>
                <div className={cls.upper_left_block}>
                    <p className={cls.title}>{title}</p>
                </div>
                <div className={cls.lower_left_block}>
                    <p className={cls.teacher}>Преподаватель:</p>
                    <p className={cls.teacher_name}>{teacher}</p>
                </div>
            </div>

            <div className={cls.right_block}>
                <p className={cls.status}>{status}</p>
                <div className={cls.right_right_block}>
                    <a className={cls.link_to_lab} href={`/labs_templates/${id}`}>Посмотреть отчёт</a> {/* ТУТ ЗАГЛУШКА, НАДО РЕАЛИЗОВАТЬ ПЕРЕХОД К ЛАБЕ */}
                    <p className={cls.date}>{date}</p>
                </div>
            </div>
        </div>
    );
};
export default LabItemProfile;

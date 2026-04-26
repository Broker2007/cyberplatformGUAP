import { Link } from 'react-router-dom';
import { memo, useMemo } from 'react';
import { classNames } from 'shared/lib/classNames/classNames';
import LabItemIcon from 'shared/assets/icons/labitem-profile.svg';
import cls from './LabItemProfile.module.scss';

type LabStatus = 'pending' | 'completed' | 'failed';

type LabItemProfileProps = {
    className?: string;
    id: number | string;
    title: string;
    status: LabStatus;
    teacher: string;
    date: string;
};

const statusMap: Record<LabStatus, string> = {
    pending: 'В процессе',
    completed: 'Завершено',
    failed: 'Ошибка',
};

const LabItemProfile = ({
    className,
    title,
    status,
    teacher,
    date,
    id,
}: LabItemProfileProps) => {
    const link = useMemo(() => `/labs_templates/${id}`, [id]);

    return (
        <div className={classNames(cls.LabItemProfile, {}, [className])}>
            <LabItemIcon />

            <div className={cls.content}>
                <div className={cls.header}>
                    <p className={cls.title}>{title}</p>
                </div>

                <div className={cls.meta}>
                    <span className={cls.teacherLabel}>Преподаватель:</span>
                    <span className={cls.teacherName}>{teacher}</span>
                </div>
            </div>

            <div className={cls.actions}>
                <span className={cls.status}>
                    {statusMap[status]}
                </span>

                <div className={cls.footer}>
                    <Link className={cls.link} to={link}>
                        Посмотреть отчёт
                    </Link>
                    <span className={cls.date}>{date}</span>
                </div>
            </div>
        </div>
    );
};

export default memo(LabItemProfile, (prev, next) => prev.id === next.id
    && prev.status === next.status
    && prev.title === next.title
    && prev.teacher === next.teacher
    && prev.date === next.date);

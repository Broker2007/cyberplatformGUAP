import React from 'react';
import { classNames } from 'shared/lib/classNames/classNames';
import { AuditLog } from '../../model/types/auditTypes';
import cls from './AuditTable.module.scss';

interface AuditTableProps {
    logs?: AuditLog[];
    isLoading?: boolean;
    className?: string;
}

// Функция для форматирования даты
const formatDate = (dateString: string) => new Date(dateString).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

// Функция для форматирования размера файла
const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

// Функция для получения цвета действия
const getActionColor = (action: string) => {
    switch (action) {
    case 'UPLOAD': return cls.upload;
    case 'REPLACE': return cls.replace;
    case 'DELETE': return cls.delete;
    case 'DOWNLOAD': return cls.download;
    default: return '';
    }
};

// Функция для перевода действия
const getActionText = (action: string) => {
    switch (action) {
    case 'UPLOAD': return 'Загрузка';
    case 'REPLACE': return 'Замена';
    case 'DELETE': return 'Удаление';
    case 'DOWNLOAD': return 'Скачивание';
    default: return action;
    }
};

// Функция для перевода роли
const getRoleText = (role: string) => {
    switch (role) {
    case 'admin': return 'Админ';
    case 'teacher': return 'Преподаватель';
    case 'student': return 'Студент';
    default: return role;
    }
};

export const AuditTable: React.FC<AuditTableProps> = ({
    logs = [],
    isLoading,
    className,
}) => {
    if (isLoading) {
        return (
            <div className={cls.loader}>
                Загрузка данных аудита...
            </div>
        );
    }

    if (!logs.length) {
        return (
            <div className={cls.empty}>
                Нет данных для отображения
            </div>
        );
    }

    return (
        <div className={classNames(cls.auditTable, {}, [className])}>
            <table className={cls.table}>
                <thead>
                    <tr>
                        <th>Дата и время</th>
                        <th>Пользователь</th>
                        <th>Роль</th>
                        <th>Действие</th>
                        <th>Лабораторная</th>
                        <th>Файл</th>
                        <th>Размер</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => (
                        <tr key={log.id}>
                            <td>{formatDate(log.timestamp)}</td>
                            <td>
                                <div className={cls.userCell}>
                                    <span className={cls.userName}>{log.userName}</span>
                                    <span className={cls.userId}>
                                        ID:
                                        {log.userId}
                                    </span>
                                </div>
                            </td>
                            <td>
                                <span className={cls.roleBadge}>
                                    {getRoleText(log.userRole)}
                                </span>
                            </td>
                            <td>
                                <span className={`${cls.actionBadge} ${getActionColor(log.action)}`}>
                                    {getActionText(log.action)}
                                </span>
                            </td>
                            <td>
                                <div className={cls.labCell}>
                                    <span className={cls.labName}>{log.labName}</span>
                                    <span className={cls.labId}>
                                        ID:
                                        {log.labId}
                                    </span>
                                </div>
                            </td>
                            <td className={cls.fileName}>{log.fileName}</td>
                            <td className={cls.fileSize}>{formatFileSize(log.fileSize)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

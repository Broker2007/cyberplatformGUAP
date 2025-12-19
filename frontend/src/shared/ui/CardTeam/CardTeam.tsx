import { classNames } from 'shared/lib/classNames/classNames';
import React, { useState } from 'react';
import cls from './CardTeam.module.scss';

interface CardTeamProps {
    className?: string,
    Icon: React.FC<React.SVGProps<SVGSVGElement>>,
    title: string,
    description: string,
    isOpen: boolean,
    spanDescription: string,
    textDescription: string,
    textDescriptionItems: string[],
}

const CardTeam = ({
    className,
    title,
    description,
    Icon,
    isOpen,
    spanDescription,
    textDescription,
    textDescriptionItems,
}: CardTeamProps) => {
    const a = 123;
    return (
        <div className={classNames(cls.CardTeam, { [cls.open]: isOpen }, [className])}>
            <div className={cls.flex_el}>
                <div className={cls.content}>
                    <div className={classNames(cls.block_icon, {}, [])}>
                        <Icon className={cls.icon} />
                    </div>
                    <div className={cls.content_head}>
                        <p className={classNames(cls.title, {}, [])}>{title}</p>
                        <p className={cls.description}>{description}</p>
                    </div>
                </div>
            </div>
            <div className={cls.content_description}>
                <p className={cls.text_description}>
                    <span className={cls.span_description}>
                        {spanDescription}
                        {' '}
                    </span>
                    {textDescription}
                </p>
                <p className={cls.text_description_ol}>Ключевые задачи:</p>
                <ol type="1" className={cls.text_description_ol_item}>
                    {textDescriptionItems.map((item, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <li key={index}>{item}</li>
                    ))}
                </ol>
            </div>
        </div>
    );
};

export default CardTeam;

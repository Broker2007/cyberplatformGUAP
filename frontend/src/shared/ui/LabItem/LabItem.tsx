/* eslint-disable max-len */
import { classNames } from 'shared/lib/classNames/classNames';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LabTemplateDescription } from 'entities/labs';
import cls from './LabItem.module.scss';
import { ThemeButton } from '../Button/ThemeButton';
import { Button } from '../Button/Button';

interface LabItemProps {
    className?: string,
    title: string,
    difficulty: 'hard' | 'easy' | 'medium',
    tags: string[],
    status: 'В процессе' | 'Не решена' | 'Решена',
    description: LabTemplateDescription,
    id:string,
    opened?:boolean
}

const LabItem = ({
    className, difficulty, tags, status, title, description, id, opened = false,
}: LabItemProps) => {
    const [open, setOpen] = useState(opened);
    const navigate = useNavigate();
    const limitWords = (text:string, maxWords:number):string => {
        if (!text) return '';
        const words = text.split(' ');
        if (words.length <= maxWords) return text;
        return `${words.slice(0, maxWords).join(' ')}...`;
    };
    const getStatusClass = (status: string) => {
        switch (status) {
        case 'В процессе':
            return cls.inProgress;
        case 'Не решена':
            return cls.notSolved;
        case 'Решена':
            return cls.solved;
        default:
            return '';
        }
    };

    const handleClick = () => {
        if (!opened) {
            setOpen((prev) => !prev);
        }
    };

    return (
        <div className={classNames(cls.main_block, { [cls.group]: opened }, [''])}>
            <div
                className={classNames(cls.LabItem, { [cls.border]: open }, [className])}
                onClick={handleClick}
                role="button"
                tabIndex={0}
            >
                <div className={cls.block_head}>
                    <p className={cls.title}>{title}</p>
                    <p className={classNames(cls.status, {}, [getStatusClass(status)])}>
                        {status}
                    </p>
                </div>
                <div className={cls.block_foot}>
                    <div className={cls.tags}>
                        {tags.map((item, index) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <span key={index} className={cls.tag}>{`#${item}`}</span>
                        ))}
                    </div>
                    <div className={cls.difficulty}>
                        <p className={cls.text_difficulty}>Сложность</p>
                        <div className={classNames(cls.block_difficulty, {}, [cls[difficulty]])}>
                            <span className={cls.difficulty_span1} />
                            <span className={cls.difficulty_span2} />
                            <span className={cls.difficulty_span3} />
                        </div>
                    </div>
                </div>
            </div>
            <div className={classNames(cls.block_description, { [cls.open]: open }, [])}>
                <p className={cls.description_title}>Информация</p>
                <p className={cls.description_text}>{limitWords(description.overview, 20)}</p>
                <Button className={cls.button_visit} theme={ThemeButton.VISIT} onClick={() => navigate(`/labs_templates/${id}`)}>
                    Перейти
                </Button>
            </div>
        </div>
    );
};

export default LabItem;

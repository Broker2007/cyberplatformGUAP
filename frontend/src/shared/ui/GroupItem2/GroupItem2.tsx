import { classNames } from 'shared/lib/classNames/classNames';
import AvatarGroupIcon from 'shared/assets/icons/example_avatar_group.svg';
import cls from './GroupItem2.module.scss';

interface GroupItemProps {
    className?: string,
    title: string,
    quantity: string,
    createdAt: string,
}

const GroupItem = ({
    className, title, quantity, createdAt,
}:GroupItemProps) => {
    const a = 123;
    return (
        <div className={classNames(cls.GroupItem, {}, [className])}>
            <div className={cls.left_block}>
                <AvatarGroupIcon className={cls.avatar} />
                <div>
                    <p className={cls.title}>{title}</p>
                    <p className={cls.quantity}>
                        <span className={cls.number}>{quantity}</span>
                        {' '}
                        участников
                    </p>
                </div>
            </div>
            <p className={cls.data}>
                Создана:
                {' '}
                <span className={cls.number}>{createdAt}</span>
            </p>
        </div>
    );
};
export default GroupItem;

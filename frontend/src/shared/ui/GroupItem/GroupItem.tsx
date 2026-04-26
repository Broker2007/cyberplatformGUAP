import { classNames } from 'shared/lib/classNames/classNames';
import GroupImg from 'shared/assets/image/group_icon.jpg';
import { FC } from 'react';
import cls from './GroupItem.module.scss';

interface GroupItemProps {
    className?: string,
    mainBool?:boolean
}

const GroupItem:FC<GroupItemProps> = ({ className, mainBool = false }) => {
    const a = 123;
    return (
        <div className={classNames(cls.name_group, { [cls.main]: mainBool }, [className])}>
            <div className={cls.left_block}>
                <img src={GroupImg} alt="иконка группы" className={cls.group_img} />
                <div className={cls.text}>
                    <p className={cls.title}>Группа &quot;Созвездие&quot;</p>
                    <p className={cls.quantity}>27 участников</p>
                </div>
            </div>

            {mainBool ? (
                <div className={cls.right_block}>
                    <p className={cls.text_invite}>Выбрана</p>
                    <p className={cls.text_edit}>Текущая группа</p>
                </div>
            ) : <p className={cls.text_edit}>Создана:27.10.2025</p>}
        </div>
    );
};
export default GroupItem;

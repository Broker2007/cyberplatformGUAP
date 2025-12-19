import { memo } from 'react';
import { AppLink } from 'shared/ui/AppLink/AppLink';
import { classNames } from 'shared/lib/classNames/classNames';
import { NavLink } from 'react-router-dom';
import cls from './SideBarItem.module.scss';
import { SideBarItemType } from '../../model/items';

interface SideBarItemProps {
    item: SideBarItemType;
    onClose: () => void;
}

const SideBarItem = memo(({ item, onClose }: SideBarItemProps) => (
    <NavLink
        to={item.path}
        className={({ isActive }) => classNames(cls.item, { [cls.active]: isActive }, [])}
        onClick={onClose}
    >
        <p className={cls.text}>{item.text}</p>
    </NavLink>
));
export default SideBarItem;

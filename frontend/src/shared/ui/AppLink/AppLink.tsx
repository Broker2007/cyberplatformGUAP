import { classNames } from 'shared/lib/classNames/classNames';
import { Link, LinkProps } from 'react-router-dom';
import { FC } from 'react';
import cls from './AppLink.module.scss';

// export enum AppLinkTheme {
//     PRIMARY = 'primary',
//     SECONDARY = 'secondary',
//     RED = 'red',
// }

interface AppLinkProps extends LinkProps {
    className?: string;
    onClose?: () => void;
}

export const AppLink: FC<AppLinkProps> = (props) => {
    const {
        to,
        className,
        children,
        onClose,
        ...otherProps
    } = props;

    return (
        <Link
            to={to}
            onClick={onClose}
            className={classNames(cls.AppLink, {}, [className])}
            {...otherProps}
        >
            {children}
        </Link>
    );
};

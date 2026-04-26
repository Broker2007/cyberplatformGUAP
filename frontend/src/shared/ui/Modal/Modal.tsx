import { useTheme } from 'app/providers/ThemeProvider';
import React, {
    ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { classNames } from 'shared/lib/classNames/classNames';
import Portal from '../Portal/Portal';
import cls from './Modal.module.scss';

interface ModalProps {
    className?: string;
    children?: ReactNode;
    isOpen?: boolean;
    onClose?: () => void;
    lazy?: boolean;
}

const ANIMATION_DELAY = 300;

const Modal = (props:ModalProps) => {
    const {
        className, children, isOpen, onClose, lazy,
    } = props;
    const [isClosing, setIsClosing] = useState(false);
    const [isMounted, setisMounted] = useState(false);
    const { theme } = useTheme();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null >(null);

    useEffect(() => {
        if (isOpen) {
            setisMounted(true);
        }
    }, [isOpen]);

    const closeHandler = useCallback(() => {
        if (onClose) {
            setIsClosing(true);
            timerRef.current = setTimeout(() => {
                onClose();
                setIsClosing(false);
            }, ANIMATION_DELAY);
        }
    }, [onClose]);
    const onKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            closeHandler();
        }
    }, [closeHandler]);
    const onContentClick = (e:React.MouseEvent) => {
        e.stopPropagation();
    };
    useEffect(() => {
        if (isOpen) {
            window.addEventListener('keydown', onKeyDown);
        }
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [isOpen, onKeyDown]);

    const mods: Record<string, boolean> = {
        [cls.opened]: !!isOpen,
        [cls.isClosing]: isClosing,
    };

    if (lazy && !isMounted) {
        return null;
    }
    return (
        <Portal>
            <div className={classNames(cls.Modal, mods, [className, theme, 'app_modal'])}>
                <div className={cls.overlay} onClick={closeHandler}>
                    <div className={cls.content} onClick={onContentClick}>
                        {children}
                    </div>
                </div>
            </div>
        </Portal>

    );
};
export default Modal;

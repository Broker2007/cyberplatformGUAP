import React, { useCallback, useEffect, useState } from 'react';
import cls from './ImageGalleryModal.module.scss';

interface Props {
    images: string[];
    initialIndex: number;
    onClose: () => void;
}

const ImageGalleryModal = ({ images, initialIndex, onClose }: Props) => {
    const [index, setIndex] = useState(initialIndex);
    const [scale, setScale] = useState(1);

    const currentImage = images[index];

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const next = useCallback(() => {
        setIndex((prev) => (prev + 1) % images.length);
        setScale(1);
    }, [images.length]);

    const prev = useCallback(() => {
        setIndex((prev) => (prev - 1 + images.length) % images.length);
        setScale(1);
    }, [images.length]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [next, prev, onClose]);

    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation();

        setScale((prev) => {
            const next = prev + (e.deltaY < 0 ? 0.2 : -0.2);
            return Math.min(Math.max(next, 1), 3);
        });
    };

    return (
        <div
            className={cls.overlay}
            onClick={onClose}
            role="button"
            tabIndex={0}
        >
            <button
                type="button"
                className={cls.left}
                onClick={(e) => {
                    e.stopPropagation();
                    prev();
                }}
            >
                ‹
            </button>

            <div
                className={cls.imageWrapper}
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={currentImage}
                    alt="preview"
                    className={cls.image}
                    style={{ transform: `scale(${scale})` }}
                    onWheel={handleWheel}
                />
            </div>

            <button
                type="button"
                className={cls.right}
                onClick={(e) => {
                    e.stopPropagation();
                    next();
                }}
            >
                ›
            </button>

            <div className={cls.counter}>
                {index + 1}
                {' '}
                /
                {images.length}
            </div>
        </div>
    );
};

export default ImageGalleryModal;

import { useState } from 'react';
import { classNames } from 'shared/lib/classNames/classNames';
import ImageGalleryModal from 'shared/ui/ImageGalleryModal/ImageGalleryModal';
import { INews } from '../../api/newsApi';
import cls from './NewsItem.module.scss';

interface NewsItemProps {
    className?: string;
    newsItems: INews;
}

const formatDate = (date: string) => new Date(date).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

const NewsItem = ({ newsItems, className }: NewsItemProps) => {
    const [gallery, setGallery] = useState<{
        images: string[];
        index: number;
    } | null>(null);

    const images = newsItems.images || [];
    const imageUrls = images.map((img) => img.url);

    const openGallery = (index: number) => {
        setGallery({
            images: imageUrls,
            index,
        });
    };

    return (
        <div className={classNames(cls.NewsItem, {}, [className])}>
            <p className={cls.title}>{newsItems.title}</p>

            {/* КАРТИНКИ */}
            {images.length > 0 && (
                <div
                    className={classNames(
                        cls.imagesBlock,
                        {},
                        [
                            images.length === 1 ? cls.single : undefined,
                            images.length === 2 ? cls.grid2 : undefined,
                            images.length === 3 ? cls.grid3 : undefined,
                            images.length >= 4 ? cls.grid4 : undefined,
                        ],
                    )}
                >
                    {images.map((img, i) => (
                        <div
                            key={i}
                            className={cls.imageItem}
                            role="button"
                            tabIndex={0}
                            onClick={() => openGallery(i)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') openGallery(i);
                            }}
                        >
                            <img
                                src={img.url}
                                alt={`${newsItems.title}-${i}`}
                                className={cls.image}
                            />
                        </div>
                    ))}
                </div>
            )}

            <p className={cls.description}>
                {newsItems.content}
            </p>

            <div className={cls.footer}>
                <span>Админ киберполигона</span>
                <span>{formatDate(newsItems.createdAt)}</span>
            </div>

            {/* МОДАЛКА */}
            {gallery && (
                <ImageGalleryModal
                    images={gallery.images}
                    initialIndex={gallery.index}
                    onClose={() => setGallery(null)}
                />
            )}
        </div>
    );
};

export default NewsItem;

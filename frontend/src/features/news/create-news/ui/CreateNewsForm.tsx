import React, { useEffect, useMemo, useState } from 'react';
import {
    useCreateNewsMutation,
    useUploadImagesMutation,
} from 'entities/news/api/newsApi';
import cls from './CreateNewsForm.module.scss';

export const CreateNewsForm = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState('');

    const [createNews, { isLoading: isCreating }] = useCreateNewsMutation();
    const [uploadImages, { isLoading: isUploading }] = useUploadImagesMutation();

    const previewUrls = useMemo(
        () => files.map((file) => URL.createObjectURL(file)),
        [files],
    );

    useEffect(
        () => () => {
            previewUrls.forEach((url) => URL.revokeObjectURL(url));
        },
        [previewUrls],
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files || []);
        setFiles((prev) => {
            const updated = [...prev, ...newFiles];
            return updated.slice(0, 4);
        });
        e.target.value = '';
    };

    const handleRemoveFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            setError('Введите заголовок');
            return;
        }
        if (!content.trim()) {
            setError('Введите текст публикации');
            return;
        }
        setError('');

        try {
            const news = await createNews({
                title: title.trim(),
                content: content.trim(),
            }).unwrap();

            if (files.length > 0) {
                await uploadImages({ id: news.id, files }).unwrap();
            }

            setTitle('');
            setContent('');
            setFiles([]);
        } catch (e) {
            console.error(e);
            setError('Не удалось создать публикацию');
        }
    };

    const busy = isCreating || isUploading;

    return (
        <div className={cls.form}>
            <h3 className={cls.formTitle}>Новая публикация</h3>

            <input
                className={cls.field}
                placeholder="Заголовок"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
                className={cls.field}
                placeholder="Текст новости"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
            />

            <label className={cls.fileLabel}>
                <span className={cls.fileLabelText}>Изображения (до 4)</span>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    className={cls.fileInput}
                    onChange={handleFileChange}
                    disabled={files.length >= 4 || busy}
                />
            </label>

            <div className={cls.counter}>
                {files.length}
                /4
            </div>

            <div className={cls.preview}>
                {previewUrls.map((url, index) => (
                    <div key={url} className={cls.previewItem}>
                        <img src={url} alt="" />
                        <button
                            type="button"
                            className={cls.removePreview}
                            onClick={() => handleRemoveFile(index)}
                            disabled={busy}
                            aria-label="Удалить изображение"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            {error ? <p className={cls.error}>{error}</p> : null}

            <button
                type="button"
                className={cls.submit}
                onClick={handleSubmit}
                disabled={busy}
            >
                {busy ? 'Сохранение…' : 'Создать'}
            </button>
        </div>
    );
};

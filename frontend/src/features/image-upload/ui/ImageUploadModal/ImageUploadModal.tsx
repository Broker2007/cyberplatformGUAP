import React, { useCallback, useRef, useState } from 'react';
import ModalUpload from 'shared/ui/Modal/Modal';
import cls from './ImageUploadModal.module.scss';
import { ImageCropper } from '../ImageCropper/ImageCropper';
import { useImageUpload } from '../../model/useImageUpload';

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess?: () => void;
}

const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp,image/*';

const isImageFile = (file: File) => file.type.startsWith('image/');

export const ImageUploadModal = ({
    isOpen,
    onClose,
    onUploadSuccess,
}: ImageUploadModalProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const {
        preview,
        setFile,
        upload,
        isLoading,
        setCroppedArea,
        reset,
    } = useImageUpload();

    const handleClose = () => {
        reset();
        setIsDragging(false);
        onClose();
    };

    const handleUpload = async () => {
        const result = await upload();

        if (result) {
            onUploadSuccess?.();
            handleClose();
        }
    };

    const pickFile = useCallback((file: File | undefined) => {
        if (file && isImageFile(file)) {
            setFile(file);
        }
    }, [setFile]);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const onDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragging(false);
        }
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        pickFile(file);
    }, [pickFile]);

    return (
        <ModalUpload isOpen={isOpen} onClose={handleClose}>
            <div className={cls.wrapper}>
                {!preview && (
                    <>
                        <button
                            type="button"
                            className={cls.dropzone}
                            data-dragging={isDragging}
                            onClick={() => inputRef.current?.click()}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    inputRef.current?.click();
                                }
                            }}
                            onDragOver={onDragOver}
                            onDragEnter={onDragEnter}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                        >
                            <span className={cls.dropIcon} aria-hidden>
                                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M8 36h32V20l-8-8H24l-4-4H8v28z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinejoin="round"
                                    />
                                    <circle cx="18" cy="18" r="3" fill="currentColor" />
                                </svg>
                            </span>
                            <span className={cls.dropTitle}>Перетащите изображение сюда</span>
                            <span className={cls.dropHint}>или нажмите, чтобы выбрать файл</span>
                            <span className={cls.dropFormats}>JPG, PNG, GIF, WebP</span>
                            <input
                                ref={inputRef}
                                type="file"
                                hidden
                                accept={ACCEPT}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    pickFile(file);
                                    e.target.value = '';
                                }}
                            />
                        </button>
                        <div className={cls.actions}>
                            <button
                                type="button"
                                className={cls.buttonCancel}
                                onClick={handleClose}
                            >
                                Отмена
                            </button>
                        </div>
                    </>
                )}

                {preview && (
                    <>
                        <ImageCropper
                            image={preview}
                            onCropComplete={setCroppedArea}
                        />

                        <div className={cls.actions}>
                            <button
                                type="button"
                                className={cls.buttonGhost}
                                onClick={() => reset()}
                            >
                                Другое фото
                            </button>
                            <button
                                type="button"
                                className={cls.buttonCancel}
                                onClick={handleClose}
                            >
                                Отмена
                            </button>
                            <button
                                type="button"
                                className={cls.buttonPrimary}
                                onClick={handleUpload}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Загрузка...' : 'Готово'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </ModalUpload>
    );
};

import { useState } from 'react';
import { getCroppedImg } from '../lib/cropImage';
import { useUploadAvatarMutation } from '../api/avatarApi';

// ✅ разрешённые типы
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ✅ разрешённые расширения (доп защита)
const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp'];

// ✅ лимит размера (5MB)
const MAX_SIZE = 50 * 1024 * 1024;

export const useImageUpload = () => {
    const [preview, setPreview] = useState<string | null>(null);
    const [croppedArea, setCroppedArea] = useState<any>(null);
    const [uploadAvatar, { isLoading }] = useUploadAvatarMutation();

    const isValidExtension = (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return ext && ALLOWED_EXT.includes(ext);
    };

    const setFile = (file: File) => {
        // ❌ проверка типа
        if (!ALLOWED_TYPES.includes(file.type)) {
            alert('Можно загружать только изображения (jpg, png, webp)');
            return;
        }

        // ❌ проверка расширения
        if (!isValidExtension(file)) {
            alert('Некорректное расширение файла');
            return;
        }

        // ❌ проверка размера
        if (file.size > MAX_SIZE) {
            alert('Файл слишком большой (макс 50MB)');
            return;
        }

        // ✅ всё ок — читаем файл
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const upload = async () => {
        if (!preview || !croppedArea) return null;

        try {
            const croppedBlob = await getCroppedImg(preview, croppedArea);

            const file = new File([croppedBlob], 'avatar.jpg', {
                type: 'image/jpeg',
            });

            const formData = new FormData();
            formData.append('avatar', file);

            const result = await uploadAvatar(formData).unwrap();

            return result;
        } catch (e) {
            console.error('Upload error:', e);
            return null;
        }
    };

    const reset = () => {
        setPreview(null);
        setCroppedArea(null);
    };

    return {
        preview,
        setFile,
        upload,
        reset,
        isLoading,
        setCroppedArea,
    };
};

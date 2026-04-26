import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import cls from './ImageCropper.module.scss';

interface Props {
  image: string;
  onCropComplete: (area: any) => void;
}

export const ImageCropper: React.FC<Props> = ({ image, onCropComplete }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);

    const onWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        setZoom((prev) => {
            const next = prev + e.deltaY * -0.001;
            return Math.min(Math.max(next, 1), 5);
        });
    }, []);

    return (
        <div className={cls.wrapper}>
            <div className={cls.cropArea} onWheel={onWheel}>
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    restrictPosition
                    minZoom={1}
                    maxZoom={5}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(_, area) => onCropComplete(area)}
                />
            </div>

            <input
                className={cls.slider}
                type="range"
                min={1}
                max={5}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
            />
        </div>
    );
};

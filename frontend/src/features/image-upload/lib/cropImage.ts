export const createImage = (url: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
});

export async function getCroppedImg(imageSrc: string, crop: any) {
    const image = await createImage(imageSrc);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const size = Math.max(crop.width, crop.height);

    canvas.width = size;
    canvas.height = size;

    ctx?.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        size,
        size,
    );

    return new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
        }, 'image/jpeg', 0.75);
    });
}

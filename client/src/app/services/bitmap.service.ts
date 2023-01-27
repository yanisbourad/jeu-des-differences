import { Injectable } from '@angular/core';
import * as constants from '@app/configuration/const-canvas';

@Injectable({
    providedIn: 'root',
})
export class BitmapService {
    getFile(e: Event): File {
        const target = e.target as HTMLInputElement;
        if (target.files === null) {
            return new File([], 'test.bmp', { type: 'image/bmp' });
        }
        return target.files[0];
    }
    async fileToImageBitmap(file: File): Promise<ImageBitmap> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const target = e.target as FileReader;
                const img = new Image();
                img.onload = () => {
                    resolve(createImageBitmap(img));
                };
                img.src = target.result as string;
            };
            reader.readAsDataURL(file);
        });
    }
    validateBitmap(img: ImageBitmap): boolean {
        return img.width === constants.defaultWidth && img.height === constants.defaultHeight;
    }
}

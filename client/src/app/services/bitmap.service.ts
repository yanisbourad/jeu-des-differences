import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class BitmapService {
    getFile(e: Event): File {
        const target = e.target as HTMLInputElement;
        if (target.files === null) {
            return new File([], '');
        }
        return target.files[0];
    }
    async fileToImageBitmap(file: File): Promise<ImageBitmap> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const target = e.target as FileReader;
                if (target.result === null) {
                    reject();
                }
                const img = new Image();
                img.onload = () => {
                    resolve(createImageBitmap(img));
                };
                img.src = target.result as string;
            };
            reader.readAsDataURL(file);
        });
    }
}

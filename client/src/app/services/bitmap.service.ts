import { Injectable } from '@angular/core';
import * as constants from '@app/configuration/const-canvas';

@Injectable({
    providedIn: 'root',
})
export class BitmapService {
    context: CanvasRenderingContext2D;

    async handleFileSelect(e: Event): Promise<ImageBitmap | undefined> {
        const newImage = this.getFile(e);
        if (!(await this.validateBitmap(newImage)).valueOf()) return undefined;
        const img = await this.fileToImageBitmap(newImage);
        if (!this.validateSize(img)) return undefined;
        return img;
    }

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
    async validateBitmap(img: File): Promise<boolean> {
        const buffer = await img.arrayBuffer();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const header = new Uint8Array(buffer, 0, 14);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const infoHeader = new Uint8Array(buffer, 14, 40);
        const bitDepth = infoHeader[14];
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (header[0] !== 0x42 || header[1] !== 0x4d) {
            alert('Not a bitmap file');
            return false;
        }
        if (bitDepth !== constants.DESIRED_BIT_DEPTH) {
            alert(`Incorrect bit depth: expected ${constants.DESIRED_BIT_DEPTH} but got ${bitDepth}`);
            return false;
        }
        return true;
    }
    validateSize(imageBitmap: ImageBitmap) {
        if (imageBitmap.width !== constants.DEFAULT_WIDTH || imageBitmap.height !== constants.DEFAULT_HEIGHT) {
            alert('Image size is not correct');
            return false;
        }
        return true;
    }
}

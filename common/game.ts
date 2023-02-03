export interface Game {
    id: number;
    name: string;
    difficulty: number;
    originalImageData: Uint8Array;
    modifiedImageData: Uint8Array;
    listDifferences: Set<number>[];
}

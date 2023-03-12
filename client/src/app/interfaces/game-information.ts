export interface GameInformation {
    gameTitle: string;
    gameMode: string; // 'solo' | 'multi'
    gameDifficulty: string;
    nDifferences: number;
    nHints: number;
    hintsPenalty: number;
    isClassical: boolean;
}

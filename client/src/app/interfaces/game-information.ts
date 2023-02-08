export interface GameInformation {
    gameTitle: string;
    gameMode: 'Partie Classique en mode solo' | 'Partie Classique en mode 1 vs 1';
    gameDifficulty: 'Facile' | 'Difficile';
    nDifferences: number;
    nHints: number;
    hintsPenalty: number;
    isClassical: boolean;
}

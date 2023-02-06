export interface GameInfo extends GameCreate {
    rankingMulti: GameRecord[];
    rankingSolo: GameRecord[];
}

export interface GameCreate {
    gameName: string;
    difficulty: string;
    originalImageData: string;
    modifiedImageData: string;
    listDifferences: number[][];
}

export interface GameRecord {
    gameName: string;
    typeGame: string;
    time: number;
    playerName: string;
    dateStart: Date;
    playing: boolean;
}

export interface TimeConfig {
    timeInit: number;
    timePen: number;
    timeBonus: number;
}


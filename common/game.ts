export interface GameInfo extends Game {
    rankingMulti: GameRecord[];
    rankingSolo: GameRecord[];
}

export interface Game {
    gameName: string;
    difficulty: string;
    originalImageData: string;
    modifiedImageData: string;
    listDifferences: string[];
}

export interface GameRecord {
    gameName: string;
    typeGame: string;
    time: String;
    playerName: string;
    dateStart: Date;
}

export interface TimeConfig {
    timeInit: number;
    timePen: number;
    timeBonus: number;
}


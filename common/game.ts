export interface GameInfo extends Game {
    rankingMulti: GameRecord[];
    rankingSolo: GameRecord[];
}

export interface Rankings {
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
    dateStart: string;
    keyServer: string;
}
export interface GamingHistory {
    gameName: string;
    dateStart: string;
    time: String;
    gameType: string;
    playerName: string;
    opponentName: string;
    hasAbandonedGame: boolean;
}

export interface TimeConfig {
    timeInit: number;
    timePen: number;
    timeBonus: number;
}


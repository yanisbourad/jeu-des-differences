export interface Game {
    name: string;
    opponentName: string;
    gameName: string;
    gameType: string;
}
export class GamersInfo {
    gameId: number;
    creatorName: string;
    opponentName: string;
    gameName: string;
    mode: string;
}

export interface GameIdentifier {
    gameId: number;
    gameName: string;
    creatorName: string;
    opponentName: string;
    mode: string;
}

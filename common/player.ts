export interface PlayerEntity {
    playerName: string;
    socketId: string;
}

export interface PlayerMulti {
    socketId: string;
    id: string;
    creatorName: string;
    opponentName: string;
    gameName: string;
}
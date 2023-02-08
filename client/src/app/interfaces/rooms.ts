import { Player } from './player';
export interface Room {
    name: string;
    host: Player;
    players: Player[];
    maxPlayers: number;
    startTime: Date;
    nHints: number;
}

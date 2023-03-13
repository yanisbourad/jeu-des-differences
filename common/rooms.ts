import { PlayerEntity } from './player';
export interface Room {
    name: string;
    host: PlayerEntity;
    players: PlayerEntity[];
    maxPlayers: number;
    startTime: Date;
}

import { Injectable } from '@nestjs/common';
import { CreateGameCardHandlerDto } from './dto/create-game-card-handler.dto';

@Injectable()
export class GameCardHandlerService {
    gamesQueue = {};
    gamers = {};

    async create(createGameCardHandlerDto: CreateGameCardHandlerDto) {
        const updatedGameInfo = { gameName: createGameCardHandlerDto.gameName, isCreated: !createGameCardHandlerDto.isCreated };
        if (!this.gamesQueue[createGameCardHandlerDto.gameName]) this.gamesQueue[createGameCardHandlerDto.gameName] = [];
        return updatedGameInfo;
    }

    getGamerName(gamerID: string): string {
        return this.gamers[gamerID];
    }

    identify(name: string, id: string): string {
        this.gamers[id] = name;
        return name;
    }

    acceptOpponent(id: string) {
        return `This action returns a #${id} gameCardHandler`;
    }

    sendFeedback(id: string): boolean {
        return true;
    }

    remove(id: string): boolean {
        delete this.gamers[id];
        return true;
    }
}

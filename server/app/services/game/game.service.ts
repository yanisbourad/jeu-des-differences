import { GameRecord, GameRecordDocument } from '@app/model/database/game-record';
import { Controller, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model } from 'mongoose';
import { join } from 'path';
import { Game, GameInfo } from './../../../../common/game';
@Injectable()
@Controller('file')
export class GameService {
    gamesNames: string[];
    rootPath = join(process.cwd(), 'assets', 'games');

    constructor(@InjectModel(GameRecord.name) public gameRecordModel: Model<GameRecordDocument>, private readonly logger: Logger) {
        if (!fs.existsSync(this.rootPath)) {
            fs.mkdirSync(this.rootPath);
        }
        this.gamesNames = fs.readdirSync(this.rootPath);
    }

    async getAllGames(): Promise<GameInfo[]> {
        const it = this.gamesNames.map(async (gameName) => {
            const game = this.getGame(gameName);
            if (game) {
                const recordsSolo = await this.gameRecordModel.find({ gameName: game.gameName, typeGame: 'solo' }).sort({ time: 1 }).limit(3).exec();
                const recordsMulti = await this.gameRecordModel
                    .find({ gameName: game.gameName, typeGame: 'multi' })
                    .sort({ time: 1 })
                    .limit(3)
                    .exec();
                return { ...game, rankingSolo: recordsSolo, rankingMulti: recordsMulti };
            }
        });
        while (!it);
        return Promise.all(it);
    }

    isValidGameName(gameName: string): boolean {
        return this.gamesNames.includes(gameName);
    }

    getGame(_gameName: string): Game {
        // NB: This can return null if the Game does not exist, you need to handle it
        if (!this.gamesNames.includes(_gameName)) {
            throw Error(`Failed to get Game: ${_gameName} does not exist`);
        }
        return JSON.parse(this.getFile(_gameName, 'info.json')) as Game;
    }

    async addGame(game: Game): Promise<void> {
        try {
            if (this.gamesNames.includes(game.gameName)) {
                throw Error(`Failed to insert Game: ${game.gameName} already exists`);
            }
            this.createFile(game.gameName, 'info.json', JSON.stringify(game));
            this.gamesNames.push(game.gameName);
            const basRecords: GameRecord[] = [];
            for (let i = 0; i < 3; i++) {
                basRecords.push({
                    gameName: game.gameName,
                    typeGame: 'multi',
                    time: '15:20', // 10min in seconds
                    playerName: 'Sharmila',
                    dateStart: new Date().getTime().toString(),
                });
                basRecords.push({
                    gameName: game.gameName,
                    typeGame: 'solo',
                    time: '12:50', // 10min in seconds
                    playerName: 'Ania',
                    dateStart: new Date().getTime().toString(),
                });
            }
            this.gameRecordModel.insertMany(basRecords);
        } catch (error) {
            throw Error(`Failed to insert Game: ${error}`);
        }
    }

    async deleteGame(_name: string): Promise<void> {
        try {
            if (!this.gamesNames.includes(_name)) {
                throw Error(`Failed to delete Game: ${_name} does not exists`);
            }
            this.deleteDirectory(_name);
            this.gamesNames = this.gamesNames.filter((gameName) => gameName !== _name);
            await this.gameRecordModel.deleteMany({ gameName: _name });
        } catch (error) {
            throw Error(`Failed to delete Game: ${error}`);
        }
    }

    async deleteAllGames(): Promise<void> {
        try {
            this.gamesNames.forEach(async (_gameName) => {
                this.deleteDirectory(_gameName);
                await this.gameRecordModel.deleteMany({ gameName: _gameName });
            });
        } catch (error) {
            return Promise.reject(`Failed to delete all Games: ${error}`);
        }
    }

    private createFile(dirName: string, fileName: string, data: string): void {
        if (!fs.existsSync(`${this.rootPath}/${dirName}`)) {
            fs.mkdirSync(`${this.rootPath}/${dirName}`);
        }
        fs.writeFileSync(`${this.rootPath}/${dirName}/${fileName}`, data, 'utf8');
    }

    private getFile(dirName: string, fileName: string): string {
        return fs.readFileSync(`${this.rootPath}/${dirName}/${fileName}`, 'utf8');
    }

    private deleteDirectory(dirName: string): void {
        fs.rmdir(join(process.cwd(), `${this.rootPath}/${dirName}`), { recursive: true }, (err) => {
            if (err) {
                throw err;
            }
        });
    }
}

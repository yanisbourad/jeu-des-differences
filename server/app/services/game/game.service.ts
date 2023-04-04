import { GameRecord, GameRecordDocument } from '@app/model/database/game-record';
import { TimerConstantsModel } from '@app/model/database/timer-constants';
import { Game, GameInfo, TimeConfig } from '@common/game';

import { Controller, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model } from 'mongoose';
import { join } from 'path';

@Injectable()
@Controller('file')
export class GameService {
    gamesNames: string[];
    // key to encrypt the game name in the database to avoid other servers to access the game records
    key: string;
    rootPath = join(process.cwd(), 'assets', 'games');
    rootPathTime = join(process.cwd(), 'assets', 'time');

    constructor(
        @InjectModel(GameRecord.name) public gameRecordModel: Model<GameRecordDocument>,
        private readonly logger: Logger,
        @InjectModel(TimerConstantsModel.name) public timerConstantsModel: Model<TimerConstantsModel>,
    ) {
        if (!fs.existsSync(this.rootPath)) {
            fs.mkdirSync(this.rootPath);
        }
        if (!fs.existsSync(this.rootPathTime)) {
            fs.mkdirSync(this.rootPathTime);
        }
        this.gamesNames = fs.readdirSync(this.rootPath);
        this.loadKeyForThisServer();
    }

    get getKey() {
        return this.key;
    }
    loadKeyForThisServer() {
        const pathKey = join(process.cwd(), 'assets', 'key.text');
        if (fs.existsSync(pathKey)) {
            this.key = fs.readFileSync(pathKey, 'utf8');
        } else {
            // generate a new key randomly
            this.key = new Date().toString();
            fs.writeFileSync(pathKey, this.key, 'utf8');
        }
    }

    async getAllGames(): Promise<GameInfo[]> {
        const it = this.gamesNames.map(async (gameName) => {
            const game = this.getGame(gameName);
            const name = gameName + this.key;
            if (game) {
                const recordsSolo = await this.gameRecordModel.find({ gameName: name, typeGame: 'solo' }).sort({ time: 1 }).limit(3).exec();
                const recordsMulti = await this.gameRecordModel.find({ gameName: name, typeGame: 'multi' }).sort({ time: 1 }).limit(3).exec();
                return { ...game, rankingSolo: recordsSolo, rankingMulti: recordsMulti };
            }
        });
        return Promise.all(it);
    }

    isValidGameName(gameName: string): boolean {
        return !this.gamesNames.includes(gameName);
    }

    getGame(_gameName: string): Game {
        // NB: This can return null if the Game does not exist, you need to handle it
        if (!this.gamesNames.includes(_gameName)) {
            throw Error(`Failed to get Game: ${_gameName} does not exist`);
        }
        return JSON.parse(this.getFile(_gameName, 'info.json')) as Game;
    }

    getSetDifference(differencesStr: string[]): Set<number>[] {
        return differencesStr.map((a: string) => new Set(a.split(',').map((b: string) => Number(b))));
    }

    getFakeGameRecords(name: string): GameRecord[] {
        const basRecords: GameRecord[] = [];
        for (let i = 0; i < 3; i++) {
            basRecords.push({
                gameName: name,
                typeGame: 'multi',
                time: '12:20', // 10min in seconds
                playerName: 'Sharmila',
                dateStart: new Date().getTime().toString(),
            });
            basRecords.push({
                gameName: name,
                typeGame: 'solo',
                time: '12:50', // 10min in seconds
                playerName: 'Ania',
                dateStart: new Date().getTime().toString(),
            });
        }
        return basRecords;
    }
    async addGame(game: Game): Promise<void> {
        if (this.gamesNames.includes(game.gameName)) {
            throw Error(`Failed to insert Game: ${game.gameName} already exists`);
        }
        this.createFile(game.gameName, 'info.json', JSON.stringify(game));
        this.gamesNames.push(game.gameName);
        const name = game.gameName + this.key;
        const basRecords: GameRecord[] = this.getFakeGameRecords(name);
        this.gameRecordModel.insertMany(basRecords);
    }
    createFile(dirName: string, fileName: string, data: string): void {
        if (!fs.existsSync(`${this.rootPath}/${dirName}`)) {
            fs.mkdirSync(`${this.rootPath}/${dirName}`);
        }
        fs.writeFileSync(`${this.rootPath}/${dirName}/${fileName}`, data, 'utf8');
    }
    getFile(dirName: string, fileName: string): string {
        return fs.readFileSync(`${this.rootPath}/${dirName}/${fileName}`, 'utf8');
    }
    deleteDirectory(dirName: string): void {
        fs.rm(`${this.rootPath}/${dirName}`, { recursive: true }, (err) => {
            if (err) {
                this.logger.error(`Failed to delete directory ${dirName}`);
            }
        });
    }
    async deleteGame(_name: string): Promise<void> {
        if (!this.gamesNames.includes(_name)) throw Error('Does not exist');
        this.deleteDirectory(_name);
        this.gamesNames = this.gamesNames.filter((gameName) => gameName !== _name);
        const name = _name + this.key;
        await this.gameRecordModel.deleteMany({ gameName: name });
    }

    async deleteAllGames(): Promise<void> {
        this.gamesNames.forEach(async (gameName) => {
            await this.deleteGame(gameName);
        });
    }

    async updateConstants(newConstants: TimeConfig): Promise<void> {
        this.createFileTime('time', 'infoTime.json', JSON.stringify(newConstants));
        await this.timerConstantsModel.updateOne({}, newConstants, { upsert: true });
    }

    async getConstants(): Promise<TimeConfig> {
        return JSON.parse(this.getFileTime('time', 'infoTime.json')) as TimeConfig;
    }

    createFileTime(dirName: string, fileName: string, data: string): void {
        if (!fs.existsSync(`${this.rootPathTime}/${dirName}`)) {
            fs.mkdirSync(`${this.rootPathTime}/${dirName}`);
        }
        fs.writeFileSync(`${this.rootPathTime}/${dirName}/${fileName}`, data, 'utf8');
    }

    getFileTime(dirName: string, fileName: string): string {
        return fs.readFileSync(`${this.rootPathTime}/${dirName}/${fileName}`, 'utf8');
    }
    populateFakeGameRecordsForOneGame(_name: string): void {
        const name = _name + this.key;
        const basRecords: GameRecord[] = this.getFakeGameRecords(name);
        this.gameRecordModel.insertMany(basRecords);
    }
    populateFakeGameRecords(): void {
        this.gamesNames.forEach((gameName) => {
            const name = gameName + this.key;
            const basRecords: GameRecord[] = this.getFakeGameRecords(name);
            this.gameRecordModel.insertMany(basRecords);
        });
    }
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class DateService {
    penalty: number = 0;
    currentTime(): string {
        return new Date().toString();
    }

    getSeconds(): number {
        return new Date().getSeconds();
    }

    getElaspedTime(startTime: Date): number {
        let currentTime = new Date();
        return Math.floor((currentTime.getTime() - startTime.getTime() + 5 * this.penalty * 1000) / 1000);
    }

    getPenalty(): number {
        return this.penalty;
    }
}

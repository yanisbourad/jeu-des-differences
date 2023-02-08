import { Injectable } from '@nestjs/common';
import { TRANSFORM_TO_SECONDS } from '@app/gateways/chat/chat.gateway.constants';

@Injectable()
export class TimeService {
    nHints: number = 0;
    penalty: number = 0;
    currentTime(): string {
        return new Date().toString();
    }
    
    getElaspedTime(startTime: Date): number {
        let currentTime = new Date();
        return Math.floor((currentTime.getTime() - startTime.getTime() + this.penalty * 
            this.nHints * TRANSFORM_TO_SECONDS) / TRANSFORM_TO_SECONDS);
    }

    resetTime(): void{
        this.nHints = 0;
        this.penalty = 0;
    }
}

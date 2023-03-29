import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class TimerConstantsModel {
    @ApiProperty()
    @IsNumber()
    timeInit: number;

    @ApiProperty()
    @IsNumber()
    timePen: number;

    @ApiProperty()
    @IsNumber()
    timeBonus: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class CreateGameRecordDto {
    @ApiProperty()
    @IsString()
    gameName: string;

    @ApiProperty()
    @IsString()
    typeGame: string;

    @ApiProperty()
    @IsNumber()
    time: number;

    @ApiProperty()
    @IsString()
    playerName: string;

    @ApiProperty()
    @IsDate()
    dateStart: Date;
}

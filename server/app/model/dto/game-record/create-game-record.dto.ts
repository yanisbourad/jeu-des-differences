import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateGameRecordDto {
    @ApiProperty()
    @IsString()
    gameName: string;

    @ApiProperty()
    @IsString()
    typeGame: string;

    @ApiProperty()
    @IsString()
    time: string;

    @ApiProperty()
    @IsString()
    playerName: string;

    @ApiProperty()
    @IsString()
    dateStart: string;

    @ApiProperty()
    @IsString()
    keyServer: string;
}

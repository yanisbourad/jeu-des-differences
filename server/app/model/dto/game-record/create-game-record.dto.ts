import { GAME_NAME_MAX_LENGTH } from '@app/model/dto/game/game.dto.constants';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateGameRecordDto {
    @IsString()
    @MaxLength(GAME_NAME_MAX_LENGTH)
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

    @ApiProperty()
    @IsBoolean()
    playing: boolean;
}

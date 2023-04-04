import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class CreateGamingHistoryDto {
    @ApiProperty()
    @IsString()
    gameName: string;

    @ApiProperty()
    @IsString()
    dateStart: string;

    @ApiProperty()
    @IsString()
    time: string;

    @ApiProperty()
    @IsString()
    gameType: string;

    @ApiProperty()
    @IsString()
    playerName: string;

    @ApiProperty()
    @IsString()
    opponentName: string;

    @ApiProperty()
    @IsBoolean()
    hasAbandonedGame: boolean;
}

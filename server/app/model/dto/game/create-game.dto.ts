import { GAME_NAME_MAX_LENGTH } from '@app/model/dto/game/game.dto.constants';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, MaxLength } from 'class-validator';

export class CreateGameDto {
    @ApiProperty({ maxLength: GAME_NAME_MAX_LENGTH })
    @IsString()
    @MaxLength(GAME_NAME_MAX_LENGTH)
    name: string;

    @ApiProperty()
    @IsString()
    _id: string;

    @ApiProperty()
    @IsArray()
    originalImageData: number[];

    @ApiProperty()
    @IsArray()
    modifiedImageData: number[];

    @ApiProperty()
    @IsArray()
    listDifferences: Set<number>[];

    @ApiProperty()
    @IsString()
    difficulty: string;
}

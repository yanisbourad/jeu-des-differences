import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { GAME_NAME_MAX_LENGTH } from './game.dto.constants';

export class UpdateGameDto {
    @ApiProperty({ maxLength: GAME_NAME_MAX_LENGTH, required: false })
    @IsOptional()
    @IsString()
    @MaxLength(GAME_NAME_MAX_LENGTH)
    gameName?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    originalImageData: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    modifiedImageData: string;

    @ApiProperty()
    @IsOptional()
    @IsArray()
    listDifferences: number[][];

    @ApiProperty()
    @IsString()
    difficulty: string;
}

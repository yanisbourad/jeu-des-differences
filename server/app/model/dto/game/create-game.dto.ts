import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CreateGameDto {
    @ApiProperty()
    @IsString()
    gameName: string;

    @ApiProperty()
    @IsString()
    originalImageData: string;

    @ApiProperty()
    @IsString()
    modifiedImageData: string;

    @ApiProperty()
    @IsArray()
    listDifferences: number[][];

    @ApiProperty()
    @IsString()
    difficulty: string;
}

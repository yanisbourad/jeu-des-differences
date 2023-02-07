import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNumber } from 'class-validator';

export class UpdateGameRecordDto {
    @ApiProperty()
    @IsNumber()
    time?: number;

    @ApiProperty()
    @IsDate()
    dateStart?: Date;

    @ApiProperty()
    @IsBoolean()
    playing?: boolean;
}

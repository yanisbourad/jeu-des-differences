import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type GamingHistoryDocument = GamingHistory & Document;
@Schema()
export class GamingHistory {
    @ApiProperty()
    @Prop({ required: true })
    gameName: string;

    @ApiProperty()
    @Prop({ required: true })
    typeGame: string;

    @ApiProperty()
    @Prop({ required: true })
    time: string;

    @ApiProperty()
    @Prop({ required: true })
    playerName: string;

    @ApiProperty()
    @Prop({ required: true })
    dateStart: string;
}

export const gamingHistorySchema = SchemaFactory.createForClass(GamingHistory);

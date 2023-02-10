import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type GameRecordDocument = GameRecord & Document;
@Schema()
export class GameRecord {
    @ApiProperty()
    @Prop({ required: true })
    gameName: string;

    @ApiProperty()
    @Prop({ required: true })
    typeGame: string;

    @ApiProperty()
    @Prop({ required: true })
    time: String;

    @ApiProperty()
    @Prop({ required: true })
    playerName: string;

    @ApiProperty()
    @Prop({ required: true })
    dateStart: string;
}

export const gameRecordSchema = SchemaFactory.createForClass(GameRecord);

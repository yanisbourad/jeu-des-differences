import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type GameDocument = Game & Document;

@Schema()
export class Game {
    @ApiProperty()
    @Prop({ required: true, unique: true })
    gameName: string;

    @ApiProperty()
    @Prop({ required: true })
    originalImageData: string;

    @ApiProperty()
    @Prop({ required: true })
    modifiedImageData: string;

    @ApiProperty()
    @Prop({ required: true })
    listDifferences: string[];

    @ApiProperty()
    @Prop({ required: true })
    difficulty: string;
}

export const gameSchema = SchemaFactory.createForClass(Game);

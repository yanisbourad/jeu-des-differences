import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type GameDocument = Game & Document;

@Schema()
export class Game {
    @ApiProperty()
    @Prop({ required: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true })
    originalImageData: number[];

    @ApiProperty()
    @Prop({ required: true })
    modifiedImageData: number[];

    @ApiProperty()
    @Prop({ required: true })
    listDifferences: Set<number>[];

    @ApiProperty()
    @Prop({ required: true })
    difficulty: string;

    @ApiProperty()
    @Prop({ required: true })
    @ApiProperty()
    _id?: string;
}

export const gameSchema = SchemaFactory.createForClass(Game);

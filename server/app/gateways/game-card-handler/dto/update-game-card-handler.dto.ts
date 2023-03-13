import { PartialType } from '@nestjs/mapped-types';
import { CreateGameCardHandlerDto } from './create-game-card-handler.dto';

export class UpdateGameCardHandlerDto extends PartialType(CreateGameCardHandlerDto) {
    id: number;
}

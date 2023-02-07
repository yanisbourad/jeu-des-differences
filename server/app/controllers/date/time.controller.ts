import { Message } from '@app/model/schema/message.schema';
import { TimeService } from '@app/services/time/time.service';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('date')
export class TimeController {
    constructor(private readonly timeService: TimeService) {}

    @Get('/')
    @ApiOkResponse({
        description: 'Return current time',
        type: Message,
    })
    dateInfo(): Message {
        return {
            title: 'Time',
            body: this.timeService.currentTime(),
        };
    }
}

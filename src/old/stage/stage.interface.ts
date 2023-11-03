import { ApiProperty } from '@nestjs/swagger'

export enum EVENT_STAGE {
  SETUP = 'SETUP',
  CHECKIN = 'CHECKIN',
  TEARDOWN = 'TEARDOWN',
  EVENT = 'EVENT'
}

export class EventStage {
  @ApiProperty({ enum: EVENT_STAGE, description: 'The current stage of the event', example: EVENT_STAGE.SETUP })
    stage: EVENT_STAGE
}

export const EVENT_STAGE_KEY = 'eventStage'

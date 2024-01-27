import { registerEnumType } from '@nestjs/graphql'

export enum EventStage {
  WAITING_FOR_TEAMS = 'WAITING_FOR_TEAMS',
  CHECKIN = 'CHECKIN',
  QUALIFICATIONS = 'QUALIFICATIONS',
  ALLIANCE_SELECTION = 'ALLIANCE_SELECTION',
  ELIMS = 'ELIMS',
  TEARDOWN = 'TEARDOWN'
}

registerEnumType(EventStage, {
  name: 'EventStage',
  description: 'The current stage of the event'
})

import { registerEnumType } from '@nestjs/graphql'

export enum Checkin {
  NOT_HERE = 'NOT_HERE',
  CHECKED_IN = 'CHECKED_IN',
  NO_SHOW = 'NO_SHOW'
}

registerEnumType(Checkin, {
  name: 'Checkin',
  description: 'The checkin status of a team'
})

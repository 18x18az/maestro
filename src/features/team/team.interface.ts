import { registerEnumType } from '@nestjs/graphql'

export enum Inspection {
  NOT_HERE = 'NOT_HERE',
  CHECKED_IN = 'CHECKED_IN',
  NO_SHOW = 'NO_SHOW',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

registerEnumType(Inspection, {
  name: 'Inspection',
  description: 'The inspection status of a team'
})

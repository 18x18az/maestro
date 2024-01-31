import { registerEnumType } from '@nestjs/graphql'

export enum Program {
  VRC = 'VRC',
  VEXU = 'VEXU'
}

registerEnumType(Program, { name: 'Program' })

export enum InspectionRollup {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETE = 'COMPLETE'
}

registerEnumType(InspectionRollup, { name: 'InspectionRollup' })

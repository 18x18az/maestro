import { registerEnumType } from '@nestjs/graphql'

export enum Program {
  VRC = 'VRC',
  VEXU = 'VEXU'
}

registerEnumType(Program, { name: 'Program' })

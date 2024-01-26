import { registerEnumType } from '@nestjs/graphql'

export interface AllianceSelectionStatus {
  picking: number | null
  picked: number | null
  pickable: number[]
  alliances: Array<[number, number]>
  remaining: number[]
}

export enum AllianceSelectionOperationType {
  ACCEPT = 'accept',
  DECLINE = 'decline',
  NO_SHOW = 'no_show'
}

registerEnumType(AllianceSelectionOperationType, { name: 'AllianceSelectionOperationType' })

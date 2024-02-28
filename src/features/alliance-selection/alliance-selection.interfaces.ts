import { registerEnumType } from '@nestjs/graphql'

export type Alliance = [number, number]
export interface AllianceSelectionStatus {
  picking: number | null
  picked: number | null
  pickable: number[]
  alliances: Alliance[]
  remaining: number[]
}

export enum AllianceSelectionOperationType {
  ACCEPT = 'accept',
  DECLINE = 'decline',
  NO_SHOW = 'no_show'
}

registerEnumType(AllianceSelectionOperationType, { name: 'AllianceSelectionOperationType' })

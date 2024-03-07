import { registerEnumType } from '@nestjs/graphql'

export enum OverlayDisplayed {
  NONE = 'NONE',
  MATCH = 'MATCH',
  CARD = 'CARD'
}

registerEnumType(OverlayDisplayed, {
  name: 'OverlayDisplayed'
})

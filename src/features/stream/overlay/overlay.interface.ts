import { registerEnumType } from '@nestjs/graphql'

export enum OverlayDisplayed {
  NONE = 'NONE',
  MATCH = 'MATCH',
  CARD = 'CARD'
}

registerEnumType(OverlayDisplayed, {
  name: 'OverlayDisplayed'
})

export enum AwardStage {
  NONE = 'NONE',
  INTRO = 'INTRO',
  REVEALED = 'REVEALED'
}

registerEnumType(AwardStage, {
  name: 'AwardStage'
})

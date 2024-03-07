import { Field, ObjectType } from '@nestjs/graphql'
import { OverlayDisplayed } from './overlay.interface'

@ObjectType()
export class Overlay {
  @Field(() => OverlayDisplayed)
    displayed: OverlayDisplayed
}

import { Field, ObjectType } from '@nestjs/graphql'
import { OverlayDisplayed } from './overlay.interface'
import { Award } from '../../award/award.object'

@ObjectType()
export class Overlay {
  @Field(() => OverlayDisplayed)
    displayed: OverlayDisplayed

  @Field(() => Award, { nullable: true })
    award?: Award
}

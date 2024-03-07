import { Field, ObjectType } from '@nestjs/graphql'
import { Scene } from '../switcher/scene.object'
import { SolidDisplayDisplayed } from './solid-display.interface'

@ObjectType()
export class SolidDisplay {
  @Field({ nullable: true })
    scene?: Scene

  @Field(() => SolidDisplayDisplayed)
    displayed: SolidDisplayDisplayed
}

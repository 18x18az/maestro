import { Field, ObjectType } from '@nestjs/graphql'
import { Scene } from '../switcher/scene.object'

@ObjectType()
export class SolidDisplay {
  @Field({ nullable: true })
    scene?: Scene
}

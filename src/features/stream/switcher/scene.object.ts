import { Field, InputType, Int, ObjectType, PartialType } from '@nestjs/graphql'
import { Camera } from '../camera/camera.object'

@InputType()
@ObjectType()
class SceneBase {
  @Field()
    name: string

  @Field()
    key: string
}

@InputType()
export class SceneEdit extends PartialType(SceneBase) {}

@ObjectType()
export class Scene extends SceneBase {
  @Field(() => Int)
    id: number

  @Field(() => Camera, { nullable: true })
    camera?: Camera
}

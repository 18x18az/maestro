import { Field, InputType, Int, ObjectType, PartialType } from '@nestjs/graphql'
import { GraphQLIP } from 'graphql-scalars'
import { Preset } from './preset.object'

@InputType()
@ObjectType()
class CameraBase {
  @Field(() => GraphQLIP)
    ip: string

  @Field()
    name: string
}

@InputType()
export class CameraEdit extends PartialType(CameraBase) {}

@ObjectType()
export class Camera extends CameraBase {
  @Field(() => Int)
    id: number

  @Field(() => [Preset])
    presets: Preset[]

  @Field(() => Preset, { nullable: true })
    currentPreset?: Preset
}

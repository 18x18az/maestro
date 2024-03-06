import { Field, InputType, Int, ObjectType, PartialType } from '@nestjs/graphql'

@InputType()
@ObjectType()
class PresetBase {
  @Field()
    name: string
}

@InputType()
export class PresetUpdate extends PartialType(PresetBase) {}

@ObjectType()
export class Preset extends PresetBase {
  @Field(() => Int)
    id: number
}

import { Field, InputType, PartialType } from '@nestjs/graphql'

@InputType()
class FieldMutation {
  @Field({ description: 'Name of the field' })
    name: string

  @Field({ description: 'Whether the field is enabled for use' })
    isEnabled: boolean

  @Field({ description: 'True for a competition field, false for a dedicated skills field' })
    isCompetition: boolean

  @Field({ description: 'Set a competition field to be able to run skills. Meaningless if the field is already a dedicated skills field.' })
    canRunSkills: boolean
}

@InputType()
export class FieldUpdate extends PartialType(FieldMutation) {
  @Field({ description: 'ID of the scene associated with the field', nullable: true })
    sceneId?: number
}

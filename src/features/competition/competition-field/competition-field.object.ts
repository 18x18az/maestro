import { Field, ObjectType } from '@nestjs/graphql'
import { Sitting } from '../match/sitting.object'

@ObjectType()
export class CompetitionField {
  @Field()
    fieldId: number

  @Field({ nullable: true })
    onFieldSitting: Sitting

  @Field({ nullable: true })
    onTableSitting: Sitting
}

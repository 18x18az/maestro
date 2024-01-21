import { Field, ObjectType } from '@nestjs/graphql'
import { Sitting } from '../match/sitting.object'
import { MATCH_STAGE } from './competition-field.interface'

@ObjectType()
export class CompetitionField {
  @Field()
    fieldId: number

  @Field({ nullable: true, description: 'The match currently on the field' })
    onFieldSitting: Sitting

  @Field({ nullable: true, description: 'The match currently on the queueing table (on deck) for the field' })
    onTableSitting: Sitting

  @Field(() => MATCH_STAGE, { description: 'The current stage of the match on the field' })
    stage: MATCH_STAGE
}

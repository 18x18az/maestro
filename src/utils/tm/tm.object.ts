import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql'
import { TmStatus } from './tm.interface'
import { GraphQLURL } from 'graphql-scalars'

@ObjectType()
@InputType()
export class TournamentManagerSetup {
  @Field(() => GraphQLURL, { description: 'The address of Tournament Manager. IP addresses must start with http e.g. http://192.168.1.42' })
    url: URL

  @Field(() => String, { description: 'The password for Tournament Manager' })
    password: string
}

@ObjectType()
export class TournamentManager extends PartialType(TournamentManagerSetup) {
  @Field(() => TmStatus, { description: 'The status of the TM server' })
    status: TmStatus
}

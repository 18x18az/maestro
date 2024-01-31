import { ArgsType, Field as GField } from '@nestjs/graphql'
import { Inspection } from '../team.interface'

@ArgsType()
export class FindTeamsArgs {
  @GField(() => Inspection, { nullable: true })
    inspectionStatus?: Inspection
}

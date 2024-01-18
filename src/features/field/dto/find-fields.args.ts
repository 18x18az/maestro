import { ArgsType, Field as GField } from '@nestjs/graphql'

@ArgsType()
export class FindFieldsArgs {
  @GField({ nullable: true })
    isEnabled?: boolean

  @GField({ nullable: true })
    isCompetition?: boolean
}

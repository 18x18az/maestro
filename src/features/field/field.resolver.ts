import { Query, Resolver } from '@nestjs/graphql'
import { FieldObject } from './field.object'

@Resolver(of => FieldObject)
export class FieldResolver {
  @Query(returns => [FieldObject])
  async fields (): Promise<FieldObject[]> {
    return []
  }
}

import { Query, Resolver } from '@nestjs/graphql'
import { Field } from './field.entity'

@Resolver(of => Field)
export class FieldResolver {
  @Query(returns => [Field])
  async fields (): Promise<Field[]> {
    return []
  }
}

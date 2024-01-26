import { Mutation, Query, Resolver } from '@nestjs/graphql'
import { TimeoutService } from './timeout.service'
import { Timeout } from './timeout.object'

@Resolver(() => Timeout)
export class TimeoutResolver {
  constructor (private readonly service: TimeoutService) {}

  @Query(() => Timeout)
  timeout (): Timeout {
    const result = this.service.getTimeout()
    return result
  }

  @Mutation(() => Timeout)
  startTimeout (): Timeout {
    this.service.startTimeout()
    return this.service.getTimeout()
  }

  @Mutation(() => Timeout)
  cancelTimeout (): Timeout {
    this.service.cancelTimeout()
    return this.service.getTimeout()
  }
}

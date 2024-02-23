import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql'
import { GraphQLURL } from 'graphql-scalars'
import { BackendStatus } from './backend.interface'

@ObjectType()
@InputType()
export class BackendSetup {
  @Field(() => GraphQLURL, { description: 'The address of the backend. IP addresses must start with http e.g. http://192.168.1.42', nullable: true })
    url: URL

//   @Field(() => String, { description: 'The password for the backend' })
//     password: string
}

@ObjectType()
export class Backend extends PartialType(BackendSetup) {
  @Field(() => BackendStatus, { description: 'The status of the backend' })
    status: BackendStatus
}

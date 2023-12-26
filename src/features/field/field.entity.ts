import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { ObjectType, Field as GField, Int } from '@nestjs/graphql'

@Entity()
@ObjectType()
export class Field {
  @PrimaryKey()
  @GField(type => Int)
    id!: number

  @Property()
  @GField()
    name!: string
}

import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class PersistentEntity {
  @PrimaryColumn()
    key: string

  @Column()
    value: string
}

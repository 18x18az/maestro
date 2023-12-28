import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class EphemeralEntity {
  @PrimaryColumn()
    key: string

  @Column()
    value: string
}

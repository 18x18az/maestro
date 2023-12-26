import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class FieldEntity {
  @PrimaryGeneratedColumn()
    id!: number

  @Column()
    name!: string
}

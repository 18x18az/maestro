import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class FieldEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    name: string

  @Column({ default: false })
    isCompetition: boolean

  @Column({ default: false })
    skillsEnabled: boolean

  @Column({ default: false })
    isEnabled: boolean
}

import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { TeamEntity } from '../team/team.entity'

@Entity()
export class AwardEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    name: string

  @JoinTable()
  @ManyToMany(() => TeamEntity, team => team.awards, { nullable: true })
    winners: TeamEntity[]
}

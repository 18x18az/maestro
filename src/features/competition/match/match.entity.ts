import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { Round } from './match.interface'
import { ContestEntity } from './contest.entity'
import { TeamEntity } from '../../team/team.entity'
import { FieldEntity } from '../../field/field.entity'
import { SittingEntity } from './sitting.entity'

export interface CreateQualMatch {
  round: Round
  number: number
  field: FieldEntity
  redTeams: TeamEntity[]
  blueTeams: TeamEntity[]
  time: Date
}

@Entity()
@Unique(['contest', 'number'])
export class MatchEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    contestId: number

  @ManyToOne(() => ContestEntity, contest => contest.matches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contestId', referencedColumnName: 'id' })
    contest: ContestEntity

  @OneToMany(() => SittingEntity, sitting => sitting.match)
    sittings: SittingEntity[]

  @Column({ type: 'int', default: 1 })
    number: number

  @Column({ default: false })
    resolved: boolean
}

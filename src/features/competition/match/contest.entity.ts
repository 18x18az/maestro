import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { Round } from './match.interface'
import { MatchEntity } from './match.entity'
import { TeamEntity } from '../../team/team.entity'

@Entity()
@Unique(['round', 'number'])
export class ContestEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column({ enum: Round, type: 'simple-enum' })
    round: Round

  @Column({ type: 'int' })
    number: number

  @OneToMany(() => MatchEntity, match => match.contest)
    matches: MatchEntity[]

  @ManyToMany(() => TeamEntity, team => team.redContests, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinTable()
    redTeams: TeamEntity[]

  @ManyToMany(() => TeamEntity, team => team.blueContests, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinTable()
    blueTeams: TeamEntity[]
}

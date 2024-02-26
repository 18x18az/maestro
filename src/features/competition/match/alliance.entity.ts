import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { TeamEntity } from '../../team/team.entity'
import { ContestEntity } from './contest.entity'

@Entity()
export class AllianceEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    team1Id: number

  @JoinColumn({ name: 'team1Id' })
  @ManyToOne(() => TeamEntity, team => team.captainedAlliances, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
    team1: TeamEntity

  @Column({ nullable: true })
    team2Id: number

  @JoinColumn({ name: 'team2Id' })
  @ManyToOne(() => TeamEntity, team => team.secondedAlliances, { onUpdate: 'CASCADE', onDelete: 'CASCADE', nullable: true })
    team2?: TeamEntity

  @OneToMany(() => ContestEntity, contest => contest.blueAlliance, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
    blueContests: ContestEntity[]

  @OneToMany(() => ContestEntity, contest => contest.redAlliance, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
    redContests: ContestEntity[]
}

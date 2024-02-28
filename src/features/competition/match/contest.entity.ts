import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { Round } from './match.interface'
import { MatchEntity } from './match.entity'
import { AllianceEntity } from './alliance.entity'

@Entity()
@Unique(['round', 'number'])
export class ContestEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column({ enum: Round, type: 'simple-enum' })
    round: Round

  @Column({ type: 'int' })
    number: number

  @OneToMany(() => MatchEntity, match => match.contest, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
    matches: MatchEntity[]

  @Column({ type: 'int', nullable: true })
    redAllianceId: number | null

  @ManyToOne(() => AllianceEntity, alliance => alliance.redContests, { onUpdate: 'CASCADE', onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'redAllianceId' })
    redAlliance: AllianceEntity | null

  @Column({ type: 'int', nullable: true })
    blueAllianceId: number | null

  @ManyToOne(() => AllianceEntity, alliance => alliance.blueContests, { onUpdate: 'CASCADE', onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'blueAllianceId' })
    blueAlliance: AllianceEntity | null
}

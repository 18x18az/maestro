import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm'
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

  @ManyToOne(() => AllianceEntity, alliance => alliance.redContests, { onUpdate: 'CASCADE', onDelete: 'CASCADE', nullable: true })
    redAlliance: AllianceEntity | null

  @ManyToOne(() => AllianceEntity, alliance => alliance.blueContests, { onUpdate: 'CASCADE', onDelete: 'CASCADE', nullable: true })
    blueAlliance: AllianceEntity | null
}

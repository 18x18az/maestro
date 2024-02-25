import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { MatchEntity } from './match.entity'

@Entity()
export class ScoreEntity {
  @PrimaryColumn({ type: 'datetime' })
    savedAt: Date

  @Column()
    matchId: number

  @ManyToOne(() => MatchEntity, match => match.scores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matchId', referencedColumnName: 'id' })
    match: MatchEntity

  @Column({ type: 'json' })
    score: string
}

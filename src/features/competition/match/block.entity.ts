import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { BlockStatus } from './match.interface'
import { CreateQualMatch } from './match.entity'
import { SittingEntity } from './sitting.entity'

export interface CreateQualBlock {
  name: string
  matches: CreateQualMatch[]
}

@Entity()
export class BlockEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    name: string

  @Column({ type: 'simple-enum', enum: BlockStatus, default: BlockStatus.NOT_STARTED })
    status: BlockStatus

  @OneToMany(() => SittingEntity, sitting => sitting.block, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
    sittings: SittingEntity[]
}

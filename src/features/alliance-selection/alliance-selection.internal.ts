import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { EventStage } from '../stage'
import { TmService } from '@/utils'
import { AllianceSelectionStatus } from './alliance-selection.interfaces'
import { AllianceSelectionPublisher } from './alliance-selection.publisher'

enum AllianceSelectionOperationType {
  ACCEPT = 'accept',
  DECLINE = 'decline',
  NO_SHOW = 'no_show'
}

interface AllianceSelectionOperation {
  type: AllianceSelectionOperationType
  team: string
}

function processAllianceSelectionOperation (status: AllianceSelectionStatus, operation: AllianceSelectionOperation): AllianceSelectionStatus {
  if (status.picking === null) {
    throw new Error('Picking is null')
  }

  const { type, team } = operation
  switch (type) {
    case AllianceSelectionOperationType.ACCEPT:
      status.alliances.push([status.picking, team])
      status.pickable.splice(status.pickable.indexOf(team), 1)
      status.remaining.splice(status.remaining.indexOf(team), 1)
      status.picking = status.remaining[0]
      status.remaining.splice(0, 1)
      if (status.pickable.includes(status.picking)) {
        status.pickable.splice(status.pickable.indexOf(status.picking), 1)
      }
      break
    case AllianceSelectionOperationType.DECLINE:
      status.pickable.splice(status.pickable.indexOf(team), 1)
      break
    case AllianceSelectionOperationType.NO_SHOW:
      status.remaining.push(team)
      break
  }

  return status
}

function processAllianceSelectionOperations (status: AllianceSelectionStatus, operations: AllianceSelectionOperation[]): AllianceSelectionStatus {
  return operations.reduce(processAllianceSelectionOperation, status)
}

@Injectable()
export class AllianceSelectionInternal {
  private readonly logger: Logger = new Logger(AllianceSelectionInternal.name)

  private rankings: string[] | null = null
  private status: AllianceSelectionStatus | null = null
  private readonly operationStack: AllianceSelectionOperation[] = []

  constructor (
    private readonly tm: TmService,
    private readonly publisher: AllianceSelectionPublisher
  ) {}

  async startAllianceSelection (): Promise<void> {
    const rankings = await this.tm.getRankings()
    this.rankings = rankings
    await this.doProcess()
  }

  async handleStage (stage: EventStage): Promise<void> {
    if (stage === EventStage.ALLIANCE_SELECTION) {
      this.logger.log('Alliance selection started')
      await this.startAllianceSelection()
    }
  }

  async broadcast (): Promise<void> {
    if (this.status === null) {
      throw new Error('Status is null')
    }

    await this.publisher.publishStatus(this.status)
  }

  async doProcess (): Promise<void> {
    if (this.rankings === null) {
      return
    }
    const remaining = [...this.rankings]
    const pickable = [...this.rankings]
    const alliances = []

    const picking = this.rankings[0]
    remaining.splice(0, 1)
    pickable.splice(0, 1)

    const initial = {
      picking,
      picked: null,
      pickable,
      remaining,
      alliances
    }

    const result = processAllianceSelectionOperations(initial, this.operationStack)

    result.picked = this.status?.picked ?? null

    const numTeams = this.rankings.length

    let numAlliances: number

    if (numTeams < 16) {
      numAlliances = Math.floor(numTeams / 2)
    } else if (numTeams < 24) {
      numAlliances = 8
    } else if (numTeams < 32) {
      numAlliances = 12
    } else {
      numAlliances = 16
    }

    if (result.alliances.length === numAlliances) {
      this.logger.log('Alliance selection complete')
      result.picking = null
      result.picked = null
      result.pickable = []
      result.remaining = []
    }

    this.status = result

    await this.broadcast()
  }

  async pick (team: string): Promise<void> {
    if (this.rankings === null || this.status === null) {
      throw new BadRequestException('Alliance selection has not started')
    }

    if (this.status.picked !== null) {
      throw new BadRequestException('Already picking')
    }

    if (this.status.picking === null) {
      throw new BadRequestException('No team picking')
    }

    if (!this.status.pickable.includes(team)) {
      throw new BadRequestException('Team not pickable')
    }

    this.logger.log(`${this.status.picking} picked ${team}`)
    this.status.picked = team

    await this.doProcess()
  }

  async accept (): Promise<void> {
    if (this.rankings === null || this.status === null) {
      throw new BadRequestException('Alliance selection has not started')
    }

    if (this.status.picked === null) {
      throw new BadRequestException('No pick to accept')
    }

    if (this.status.picking === null) {
      throw new BadRequestException('No team picking')
    }

    this.logger.log(`${this.status.picked} accepted ${this.status.picking}`)
    this.operationStack.push({
      type: AllianceSelectionOperationType.ACCEPT,
      team: this.status.picked
    })

    this.status.picked = null
    await this.doProcess()
  }

  async decline (): Promise<void> {
    if (this.rankings === null || this.status === null) {
      throw new BadRequestException('Alliance selection has not started')
    }

    if (this.status.picked === null) {
      throw new BadRequestException('No pick to decline')
    }

    if (this.status.picking === null) {
      throw new BadRequestException('No team picking')
    }

    this.logger.log(`${this.status.picked} declined ${this.status.picking}`)
    this.operationStack.push({
      type: AllianceSelectionOperationType.DECLINE,
      team: this.status.picked
    })

    this.status.picked = null
    await this.doProcess()
  }

  async cancel (): Promise<void> {
    if (this.rankings === null || this.status === null) {
      throw new BadRequestException('Alliance selection has not started')
    }

    if (this.status.picked === null) {
      throw new BadRequestException('No pick to cancel')
    }

    if (this.status.picking === null) {
      throw new BadRequestException('No team picking')
    }

    this.logger.log(`Cancelled ${this.status.picking} picking ${this.status.picked}`)

    this.status.picked = null
    await this.doProcess()
  }

  async undo (): Promise<void> {
    if (this.rankings === null || this.status === null) {
      throw new BadRequestException('Alliance selection has not started')
    }

    if (this.status.picked !== null) {
      this.status.picked = null
    }

    if (this.operationStack.length === 0) {
      throw new BadRequestException('No operations to undo')
    }

    this.logger.log('Undoing last operation')

    this.operationStack.pop()
    await this.doProcess()
  }
}

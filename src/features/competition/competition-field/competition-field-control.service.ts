import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { MATCH_STAGE } from './competition-field.interface'
import { LoadFieldEvent } from '../../field-control/load-field.event'
import { CONTROL_MODE } from '../../field-control/field-control.interface'
import { QueueSittingEvent } from './queue-sitting.event'
import { RemoveOnTableSittingEvent } from './remove-on-table-sitting.event'
import { CompetitionFieldRepo } from './competition-field.repo'

@Injectable()
export class CompetitionFieldControlService {
  private readonly logger: Logger = new Logger(CompetitionFieldControlService.name)

  private readonly cache: Map<number, MATCH_STAGE> = new Map()

  constructor (
    private readonly loadField: LoadFieldEvent,
    private readonly queueEvent: QueueSittingEvent,
    private readonly removeEvent: RemoveOnTableSittingEvent,
    private readonly repo: CompetitionFieldRepo
  ) {}

  async onModuleInit (): Promise<void> {
    this.queueEvent.registerAfter(async (data) => {
      await this.putOnField(data.fieldId)
    })

    this.removeEvent.registerBefore(async (data) => {
      this.remove(data.fieldId)
    })
  }

  async onApplicationBootstrap (): Promise<void> {
    const fields = await this.repo.getAllFields()

    for (const field of fields) {
      if (field.onFieldSittingId !== null) {
        await this.putOnField(field.fieldId)
      }
    }
  }

  get (fieldId: number): MATCH_STAGE {
    const cached = this.cache.get(fieldId)
    if (cached === undefined) {
      return MATCH_STAGE.EMPTY
    }
    return cached
  }

  remove (fieldId: number): void {
    // Cannot remove a field that is not in the cache
    const cached = this.cache.get(fieldId)
    if (cached === undefined) {
      throw new BadRequestException(`field ${fieldId} not in cache`)
    }

    // Cannot remove a field that is in the middle of a match
    if (cached === MATCH_STAGE.AUTON || cached === MATCH_STAGE.DRIVER) {
      throw new BadRequestException(`field ${fieldId} is in a match`)
    }

    // Remove the field from the cache
    this.cache.delete(fieldId)
  }

  async putOnField (fieldId: number): Promise<void> {
    const current = this.get(fieldId)

    if (current !== MATCH_STAGE.EMPTY) {
      throw new BadRequestException(`cannot put field ${fieldId} on field`)
    }

    this.cache.set(fieldId, MATCH_STAGE.QUEUED)
    await this.loadField.execute({ fieldId, mode: CONTROL_MODE.AUTO, duration: 15 * 1000 })
  }

  async canStartAuto (fieldId: number): Promise<boolean> {
    // Ensure that auto is loaded and ready to go
    // const current = await this.get(fieldId)
    // if (current !== MATCH_STAGE.QUEUED) {
    //   this.logger.log(`field ${fieldId} is not ready to start auto`)
    //   return false
    // }

    return true
  }

  async startAuto (fieldId: number, endCb?: (fieldId: number) => Promise<void>): Promise<void> {
    if (!await this.canStartAuto(fieldId)) {
      this.logger.warn(`cannot start auto on field ${fieldId}`)
      throw new BadRequestException(`cannot start auto on field ${fieldId}`)
    }

    // await this.startField.execute({
    //   fieldId,
    //   _endCb: async () => {
    //     await this.onAutoEnd(fieldId)
    //     if (endCb !== undefined) {
    //       await endCb(fieldId)
    //     }
    //   }
    // })
    this.cache.set(fieldId, MATCH_STAGE.AUTON)
  }

  async canEndAuto (fieldId: number): Promise<boolean> {
    // const current = await this.get(fieldId)
    // if (current !== MATCH_STAGE.AUTON) {
    //   this.logger.log(`field ${fieldId} is not in auton`)
    //   return false
    // }
    return true
  }

  private async onAutoEnd (fieldId: number): Promise<void> {
    if (!await this.canEndAuto(fieldId)) {
      this.logger.warn(`cannot end auto on field ${fieldId}`)
      throw new Error(`cannot end auto on field ${fieldId}`)
    }

    await this.loadField.execute({ fieldId, mode: CONTROL_MODE.DRIVER, duration: 105 * 1000 })
    this.cache.set(fieldId, MATCH_STAGE.SCORING_AUTON)
  }

  async endAutoEarly (fieldId: number): Promise<void> {
    if (!await this.canEndAuto(fieldId)) {
      throw new BadRequestException(`cannot end auto on field ${fieldId}`)
    }

    // await this.stopField.execute({ fieldId })
  }

  async canStartDriver (fieldId: number): Promise<boolean> {
    // Ensure that driver is loaded and ready to go
    // const current = await this.get(fieldId)
    // if (current !== MATCH_STAGE.SCORING_AUTON) {
    //   this.logger.log(`field ${fieldId} is not scoring auton`)
    //   return false
    // }

    return true
  }

  async startDriver (fieldId: number, endCb?: (fieldId: number) => Promise<void>): Promise<void> {
    if (!await this.canStartDriver(fieldId)) {
      this.logger.warn(`cannot start driver on field ${fieldId}`)
      throw new BadRequestException(`cannot start driver on field ${fieldId}`)
    }

    // await this.startField.execute({
    //   fieldId,
    //   _endCb: async () => {
    //     await this.onDriverEnd(fieldId)
    //     if (endCb !== undefined) {
    //       await endCb(fieldId)
    //     }
    //   }
    // })
    this.cache.set(fieldId, MATCH_STAGE.DRIVER)
  }

  async canEndDriver (fieldId: number): Promise<boolean> {
    // const current = await this.get(fieldId)

    // if (current !== MATCH_STAGE.DRIVER) {
    //   this.logger.log(`field ${fieldId} is not in driver`)
    //   return false
    // }

    return true
  }

  private async onDriverEnd (fieldId: number): Promise<void> {
    if (!await this.canEndDriver(fieldId)) {
      throw new Error(`cannot end driver on field ${fieldId}`)
    }

    this.cache.set(fieldId, MATCH_STAGE.OUTRO)
    // const matchOnField = await this.repo.getMatchOnField(fieldId)
    // if (matchOnField === null) {
    //   throw new Error(`no match on field ${fieldId} but it ended`)
    // }
    // await this.matches.markPlayed(matchOnField)
  }

  async onOutroEnd (fieldId: number): Promise<void> {
    // if (await this.get(fieldId) !== MATCH_STAGE.OUTRO) {
    //   throw new Error(`field ${fieldId} is not in outro`)
    // }

    await this.remove(fieldId)
  }

  async endDriverEarly (fieldId: number): Promise<void> {
    if (!await this.canEndDriver(fieldId)) {
      throw new BadRequestException(`cannot end driver on field ${fieldId}`)
    }

    // await this.stopField.execute({ fieldId })
  }

  // async get (fieldId: number): Promise<MATCH_STAGE> {
  //   // If there is no match on the field, return empty
  //   const onFieldMatchId = await this.repo.getMatchOnField(fieldId)
  //   if (onFieldMatchId === null) {
  //     return MATCH_STAGE.EMPTY
  //   }

  //   // If there is a cached stage, return it
  //   const cached = this.cache.get(fieldId)
  //   if (cached !== undefined) {
  //     return cached
  //   }

  //   // Otherwise, determine stage from the database
  //   // const baseStatus = await this.matches.getMatchStatus(onFieldMatchId)
  //   // switch (baseStatus) {
  //   //   case SittingStatus.QUEUED:
  //   //     return MATCH_STAGE.QUEUED
  //   //   case SittingStatus.SCORING:
  //   //     return MATCH_STAGE.SCORING
  //   // }

  //   // throw new Error(`match with status ${baseStatus} should not be on field`)
  // }

  async isActive (fieldId: number): Promise<boolean> {
    // const stage = await this.get(fieldId)
    // return stage === MATCH_STAGE.AUTON || stage === MATCH_STAGE.DRIVER || stage === MATCH_STAGE.SCORING_AUTON
    return false
  }

  // async isRunning (fieldId: number): Promise<boolean> {
  //   return await this.control.isRunning(fieldId)
  // }
}

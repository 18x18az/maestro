import { StorageService } from '@/utils/storage/storage.service'
import { Injectable, Logger } from '@nestjs/common'
import { MatchResult, STAGE, FieldState, MATCH_STATE } from './simple.interface'
import { SimplePublisher } from './simple.publisher'
import { SimpleRepo } from './simple.repo'
import { qualParser } from './qualParser'
import { Cron } from '@nestjs/schedule'

import { FieldControlService } from './field-control.service'
import { MatchService } from './match.service'
import { TmService } from './tm-service'
import { StageService } from './stage.service'
import { MatchLifecycleService } from './match-lifecycle.service'

@Injectable()
export class SimpleService {
  private readonly logger = new Logger(SimpleService.name)
  private readonly matchResult: MatchResult | null = null

  constructor (private readonly storage: StorageService,
    private readonly publisher: SimplePublisher,
    private readonly repo: SimpleRepo,
    private readonly fieldControl: FieldControlService,
    private readonly match: MatchService,
    private readonly tm: TmService,
    private readonly stage: StageService,
    private readonly lifecycle: MatchLifecycleService
  ) {}

  async onApplicationBootstrap (): Promise<void> {
    await this.repo.ensureFieldsExists()
    const stage = await this.stage.getStage()

    if (stage === STAGE.WAITING_FOR_TEAMS) return

    await this.tm.load()

    if (stage === STAGE.WAITING_FOR_MATCHES) return

    this.logger.log('loading qual matches')

    await this.fieldControl.initializeFields()
    await this.publishFields()
    await this.loadFields()
  }

  @Cron('*/10 * * * * *')
  async pollResults (): Promise<void> {
    const pendingScoreFields = this.fieldControl.getPendingScoreFields()

    if (pendingScoreFields.length === 0) return

    const results = await this.tm.getMatchResults()
    if (results === null) return

    for (const pendingField of pendingScoreFields) {
      const ident = pendingField.match
      if (ident === undefined) throw new Error('Field is pending but has no match')
      const result = results.find(result => result.round === ident.round && result.match === ident.match && result.sitting === ident.sitting)
      if (result === undefined) continue

      this.logger.log(`Match ${ident.round}-${ident.match}-${ident.sitting} on ${pendingField.name} has results`)

      await this.lifecycle.onMatchScored(pendingField)
    }
  }

  private async publishFields (): Promise<void> {
    const fields = await this.repo.getFields()
    await this.publisher.publishFields(fields)
  }

  async handleQualListUpload (data: string): Promise<void> {
    const fields = await this.repo.getFieldIds()
    const [blocks, fieldNames] = qualParser(data, fields)

    this.logger.log(`Storing ${blocks.length} qual blocks`)

    await this.repo.setFieldNames(fieldNames)
    await this.repo.storeBlocks(blocks)
    await this.fieldControl.initializeFields()

    await this.publishFields()

    await this.stage.setStage(STAGE.QUAL_MATCHES)
  }

  async reset (): Promise<void> {
    await this.storage.clearEphemeral()
    await this.repo.reset()
    await this.stage.setStage(STAGE.WAITING_FOR_TEAMS)
  }

  private async loadFields (): Promise<void> {
    this.logger.log('Loading fields')
    const currentBlock = await this.repo.getInProgressBlock()

    if (currentBlock === null) {
      this.logger.log('No block in progress')
      return
    }

    const fieldIds = await this.repo.getFieldIds()
    for (const fieldId of fieldIds) {
      const match = await this.repo.getCurrentMatch(fieldId, currentBlock)
      if (match === null) {
        continue
      }

      this.logger.log(`Loading match ${match?.round}-${match?.matchNum}-${match?.sitting} on ${fieldId}`)

      const matchProgress = match.status

      let fieldState = FieldState.ON_DECK

      if (matchProgress === MATCH_STATE.NOT_STARTED || matchProgress === MATCH_STATE.RESOLVED) {
        throw new Error('Match not on field')
      } else if (matchProgress === MATCH_STATE.ON_FIELD) {
        fieldState = FieldState.ON_DECK
      } else if (matchProgress === MATCH_STATE.SCORING) {
        fieldState = FieldState.SCORING
      }

      await this.fieldControl.putMatchOnField(fieldId, match, fieldState)
    }
  }

  private async startNextBlock (): Promise<void> {
    const block = await this.repo.getNextBlockId()

    if (block === null) {
      // TODO handle end of quals
      return
    }

    const fieldIds = await this.repo.getFieldIds()
    for (const fieldId of fieldIds) {
      await this.match.queueField(fieldId)
    }
  }

  async continue (): Promise<void> {
    const stage = await this.stage.getStage()

    if (stage === STAGE.QUAL_MATCHES) {
      if (this.fieldControl.allFieldsIdle()) {
        await this.startNextBlock()
      }
    }
  }
}

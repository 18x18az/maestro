import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { EventStage, StageService } from '../stage'
import { FieldService } from '../field/field.service'
import { CreateQualBlockDto, CreateQualDto, MatchRepo } from './match.repo'
import { MatchInternal } from './match.internal'

@Injectable()
export class QualService {
  private readonly logger = new Logger(QualService.name)

  constructor (
    private readonly stage: StageService,
    private readonly field: FieldService,
    private readonly repo: MatchRepo,
    private readonly service: MatchInternal
  ) {}

  async handleUpload (file: string): Promise<void> {
    if (this.stage.getStage() !== EventStage.CHECKIN) {
      this.logger.warn('Received match data while not in CHECKIN stage')
      throw new BadRequestException('Received match data while not in CHECKIN stage')
    }

    this.logger.log('Received match data')

    const rawMatches = file.split('\n').slice(1).filter(line => line.length > 0)

    const fieldNames = [...new Set(rawMatches.map(line => line.split(',')[4]))]
    await this.field.initializeCompetitionFields(fieldNames)

    const fields = await this.field.getCompetitionFields()

    let lastTime: Date | undefined

    const blocksToCreate: CreateQualBlockDto[] = []
    let currentBlock: CreateQualBlockDto = { name: 'Morning', quals: [] }
    blocksToCreate.push(currentBlock)

    for (const rawMatch of rawMatches) {
      const columns = rawMatch.split(',')
      const matchNumber = parseInt(columns[3])
      const fieldName = columns[4]
      const associatedField = fields.find(field => field.name === fieldName)
      if (associatedField === undefined) throw new Error(`Field ${fieldName} not found`)
      const fieldId = associatedField.id
      const red1 = columns[5]
      const red2 = columns[6]
      const red = { team1: red1, team2: red2 }
      const blue1 = columns[8]
      const blue2 = columns[9]
      const blue = { team1: blue1, team2: blue2 }
      const time = new Date(columns[17]).toISOString()

      const match: CreateQualDto = {
        matchNumber,
        red1: red.team1,
        red2: red.team2,
        blue1: blue.team1,
        blue2: blue.team2,
        field: fieldId,
        time
      }

      const currentTime = new Date(time)
      if (lastTime !== undefined && currentTime.getTime() - lastTime.getTime() > 25 * 60 * 1000) {
        currentBlock = { name: 'Afternoon', quals: [] }
        blocksToCreate.push(currentBlock)
      }

      lastTime = currentTime
      currentBlock.quals.push(match)
    }

    await this.repo.createQuals(blocksToCreate)
    await this.service.loadQualState()
  }
}

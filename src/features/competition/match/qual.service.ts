import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { MatchRepo } from './match.repo'
import { EventStage, StageService } from '../../stage'
import { FieldService } from '../../field/field.service'
import { CreateQualBlock } from './block.entity'
import { CreateQualMatch } from './match.entity'
import { Round } from './match.interface'
import { TeamService } from '../../team/team.service'

@Injectable()
export class QualService {
  private readonly logger = new Logger(QualService.name)

  constructor (
    private readonly stage: StageService,
    private readonly repo: MatchRepo,
    private readonly field: FieldService,
    private readonly teams: TeamService
  ) {}

  async handleUpload (file: string): Promise<void> {
    if (await this.stage.getStage() !== EventStage.CHECKIN) {
      this.logger.warn('Received match data while not in CHECKIN stage')
      throw new BadRequestException('Received match data while not in CHECKIN stage')
    }

    this.logger.log('Received qualification match list')

    const rawMatches = file.split('\n').slice(1).filter(line => line.length > 0)

    const fieldNames = [...new Set(rawMatches.map(line => line.split(',')[4]))]
    await this.field.configureCompetitionFields(fieldNames)
    const fields = await this.field.getCompetitionFields()

    let lastTime: Date | undefined

    const blocksToCreate: CreateQualBlock[] = []
    let currentBlock: CreateQualBlock = { name: 'Morning', matches: [] }
    blocksToCreate.push(currentBlock)

    for (const rawMatch of rawMatches) {
      const columns = rawMatch.split(',')
      const matchNumber = parseInt(columns[3])
      const fieldName = columns[4]
      const fieldIndex = fieldNames.indexOf(fieldName)
      const field = fields[fieldIndex]

      const red1 = this.teams.getTeamByNumber(columns[5])
      const red2 = this.teams.getTeamByNumber(columns[6])
      const blue1 = this.teams.getTeamByNumber(columns[8])
      const blue2 = this.teams.getTeamByNumber(columns[9])

      const blueTeams = Promise.all([blue1, blue2])
      const redTeams = Promise.all([red1, red2])
      const time = new Date(columns[17])

      const match: CreateQualMatch = {
        round: Round.QUAL,
        number: matchNumber,
        blueTeams: await blueTeams,
        redTeams: await redTeams,
        field,
        time
      }

      const currentTime = new Date(time)
      if (lastTime !== undefined && currentTime.getTime() - lastTime.getTime() > 25 * 60 * 1000) {
        currentBlock = { name: 'Afternoon', matches: [] }
        blocksToCreate.push(currentBlock)
      }

      lastTime = currentTime
      currentBlock.matches.push(match)
    }

    for (const block of blocksToCreate) {
      await this.repo.createQualBlock(block)
    }

    await this.stage.setStage(EventStage.QUALIFICATIONS)
  }
}

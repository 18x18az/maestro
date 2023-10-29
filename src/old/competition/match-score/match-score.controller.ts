import {
  Body,
  Controller,
  Param,
  Post
} from '@nestjs/common'
import { MatchScoreService } from './match-score.service'
import { EventPattern } from '@nestjs/microservices'
import { AUTON_WINNER, AllianceRawUpdate, MatchMetadataUpload } from '.'
import { GenericMatchParams, MatchScoreParams, SpecificPortionAllianceParams, SpecificPortionTeamParams } from './match-score.controller.dto'
import { QUAL_MATCH_LIST_CHANNEL, QualMatch } from '@/old/initial'

@Controller('matches')
export class MatchScoreController {
  constructor (private readonly service: MatchScoreService) {}

  // Initiates score process for all matches
  // By either loading the saved raw score if the corresponding match exists
  // Or by creating a new match with the default raw score if it does not
  @EventPattern(QUAL_MATCH_LIST_CHANNEL)
  async handleQualMatches (matches: QualMatch[]): Promise<void> {
    await this.service.handleReceiveQualMatchList(matches)
  }

  @Post(':round/:matchId/:color')
  async updateAllianceRawScore (@Param() params: MatchScoreParams, @Body() update: AllianceRawUpdate): Promise<void> {
    await this.service.updateAllianceRawScore(params, update)
  }

  @Post(':round/:matchId/save')
  async saveScore (@Param() params: GenericMatchParams): Promise<void> {
    await this.service.save(params)
  }

  @Post(':round/:matchId/lock')
  async setLock (@Param() params: GenericMatchParams, @Body() lock: boolean): Promise<void> {
    await this.service.setLock(params, lock)
  }

  @Post(':round/:matchId/autonOutcome')
  async updateAutonOutcome (@Param() params: GenericMatchParams, @Body() autonOutcome: AUTON_WINNER): Promise<void> {
    await this.service.updateAutonOutcome(params, autonOutcome)
  }

  @Post('qual/:matchId/:color/awp')
  async updateAllianceGotAwp (@Param() params: SpecificPortionAllianceParams, @Body() gotAwp: boolean): Promise<void> {
    await this.service.updateAllianceGotAwp(params, gotAwp)
  }

  @Post('qual/:matchId/:color/:teamId/meta')
  async updateTeamMeta (@Param() params: SpecificPortionTeamParams, @Body() meta: MatchMetadataUpload): Promise<void> {
    await this.service.updateTeamMeta(params, meta)
  }

  @Post('elim/:matchId/:color/meta')
  async updateAllianceMeta (@Param() params: SpecificPortionAllianceParams, @Body() meta: MatchMetadataUpload): Promise<void> {
    await this.service.updateAllianceMeta(params, meta)
  }
}

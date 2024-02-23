import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { Team } from './team.object'
import { TeamRepo } from './team.repo'
import { TeamEntity } from './team.entity'
import { RankingService } from '../ranking/ranking.service'
import { Inspection } from './team.interface'
import { TeamInspectionGroup } from '../inspection/inspection-group.object'
import { InspectionService, TeamInspectionGroupEntity } from '../inspection/inspection.service'
import { FindTeamsArgs } from './dto/find-teams.args'
import { CheckinUpdateEvent } from './checkin-update.event'
import { CheckinService } from './checkin.service'

@Resolver(() => Team)
export class TeamResolver {
  constructor (
    private readonly repo: TeamRepo,
    private readonly rankService: RankingService,
    private readonly inspectionService: InspectionService,
    private readonly checkinUpdate: CheckinUpdateEvent,
    private readonly checkin: CheckinService
  ) {}

  @Query(() => [Team])
  async teams (@Args() args: FindTeamsArgs): Promise<TeamEntity[]> {
    const { inspectionStatus, ...rest } = args
    let teams = await this.repo.getTeams(rest)

    if (inspectionStatus !== undefined) {
      if (inspectionStatus === Inspection.NOT_HERE || inspectionStatus === Inspection.NO_SHOW) {
        teams = teams.filter(team => team.checkin === inspectionStatus)
      } else {
        teams = teams.filter(team => team.checkin === Inspection.CHECKED_IN)
        teams = teams.filter(team => this.inspectionService.getInspectionSummary(team.id) === inspectionStatus)
      }
    }

    return teams
  }

  @Query(() => Team)
  async team (@Args({ name: 'teamId', type: () => Int }) teamId: number): Promise<TeamEntity> {
    return await this.repo.getTeam(teamId)
  }

  @ResolveField(() => Int)
  async rank (@Parent() team: TeamEntity): Promise<number | null> {
    return this.rankService.getRanking(team.number)
  }

  @ResolveField(() => TeamInspectionGroup)
  async inspection (@Parent() team: TeamEntity): Promise<TeamInspectionGroupEntity[]> {
    return await this.inspectionService.getTeamInspectionGroups(team.id)
  }

  @ResolveField(() => Inspection)
  async inspectionStatus (@Parent() team: TeamEntity): Promise<Inspection> {
    return await this.checkin.getInspectionSummary(team.id)
  }

  @Mutation(() => Team)
  async markCheckin (@Args({ name: 'teamId', type: () => Int }) teamId: number, @Args({ name: 'status', type: () => Inspection }) status: Inspection): Promise<TeamEntity> {
    const result = await this.checkinUpdate.execute({ team: teamId, status })
    return result.teamEntity
  }

  @Mutation(() => Team)
  async setInspectionPoint (@Args({ name: 'teamId', type: () => Int }) teamId: number, @Args({ name: 'pointId', type: () => Int }) pointId: number, @Args({ name: 'isMet', type: () => Boolean }) isMet: boolean): Promise<TeamEntity> {
    await this.inspectionService.setTeamInspectionPoint(teamId, pointId, isMet)
    return await this.repo.getTeam(teamId)
  }
}

import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { Team } from './team.object'
import { TeamRepo } from './team.repo'
import { TeamEntity } from './team.entity'
import { RankingService } from '../ranking/ranking.service'
import { Checkin } from './team.interface'
import { CheckinService } from './checkin.service'
import { TeamInspectionGroup } from '../inspection/inspection-group.object'
import { InspectionService, TeamInspectionGroupEntity } from '../inspection/inspection.service'
import { InspectionRollup } from '../inspection/inspection.interface'

@Resolver(() => Team)
export class TeamResolver {
  constructor (
    private readonly repo: TeamRepo,
    private readonly rankService: RankingService,
    private readonly checkin: CheckinService,
    private readonly inspectionService: InspectionService
  ) {}

  @Query(() => [Team])
  async teams (): Promise<TeamEntity[]> {
    return await this.repo.getTeams()
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

  @ResolveField(() => InspectionRollup)
  inspectionStatus (@Parent() team: TeamEntity): InspectionRollup {
    return this.inspectionService.getInspectionSummary(team.id)
  }

  @Mutation(() => Team)
  async markCheckin (@Args({ name: 'teamId', type: () => Int }) teamId: number, @Args({ name: 'status', type: () => Checkin }) status: Checkin): Promise<TeamEntity> {
    return await this.checkin.markCheckinStatus(teamId, status)
  }

  @Mutation(() => Team)
  async setInspectionPoint (@Args({ name: 'teamId', type: () => Int }) teamId: number, @Args({ name: 'pointId', type: () => Int }) pointId: number, @Args({ name: 'isMet', type: () => Boolean }) isMet: boolean): Promise<TeamEntity> {
    await this.inspectionService.setTeamInspectionPoint(teamId, pointId, isMet)
    return await this.repo.getTeam(teamId)
  }
}

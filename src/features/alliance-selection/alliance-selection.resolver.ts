import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { AllianceSelection } from './alliance-selection.object'
import { AllianceSelectionInternal } from './alliance-selection.internal'
import { AllianceSelectionStatus } from './alliance-selection.interfaces'
import { TeamService } from '../team/team.service'
import { Team } from '../team/team.object'
import { TeamEntity } from '../team/team.entity'

@Resolver(() => AllianceSelection)
export class AllianceSelectionResolver {
  constructor (private readonly service: AllianceSelectionInternal, private readonly teams: TeamService) {}

  @Query(() => AllianceSelection, { nullable: true })
  allianceSelection (): AllianceSelectionStatus | null {
    return this.service.getStatus()
  }

  // @Mutation(() => AllianceSelection)
  // async startAllianceSelection (): Promise<AllianceSelectionStatus> {
  //   return await this.service.startAllianceSelection()
  // }

  @Mutation(() => AllianceSelection)
  allianceSelectionPick (@Args({ type: () => Int, name: 'teamId' }) teamId: number): AllianceSelectionStatus | null {
    this.service.pick(teamId)
    return this.service.getStatus()
  }

  @Mutation(() => AllianceSelection)
  allianceSelectionAccept (): AllianceSelectionStatus | null {
    this.service.accept()
    return this.service.getStatus()
  }

  @Mutation(() => AllianceSelection)
  allianceSelectionDecline (): AllianceSelectionStatus | null {
    this.service.decline()
    return this.service.getStatus()
  }

  @Mutation(() => AllianceSelection)
  allianceSelectionUndo (): AllianceSelectionStatus | null {
    this.service.undo()
    return this.service.getStatus()
  }

  @Mutation(() => AllianceSelection)
  allianceSelectionCancel (): AllianceSelectionStatus | null {
    this.service.cancel()
    return this.service.getStatus()
  }

  @ResolveField(() => Team, { nullable: true })
  async picking (@Parent() status: AllianceSelectionStatus): Promise<TeamEntity | null> {
    if (status.picking === null) return null
    return await this.teams.getTeam(status.picking)
  }

  @ResolveField(() => Team, { nullable: true })
  async picked (@Parent() status: AllianceSelectionStatus): Promise<TeamEntity | null> {
    if (status.picked === null) return null
    return await this.teams.getTeam(status.picked)
  }

  @ResolveField(() => [Team])
  async pickable (@Parent() status: AllianceSelectionStatus): Promise<TeamEntity[]> {
    return await Promise.all(status.pickable.map(async (team) => await this.teams.getTeam(team)))
  }

  @ResolveField(() => [[Team, Team]])
  async alliances (@Parent() status: AllianceSelectionStatus): Promise<Array<[TeamEntity, TeamEntity]>> {
    return await Promise.all(status.alliances.map(async (alliance) => {
      const team1Promise = this.teams.getTeam(alliance[0])
      const team2Promise = this.teams.getTeam(alliance[1])

      return [await team1Promise, await team2Promise]
    }))
  }

  @ResolveField(() => [Team])
  async remaining (@Parent() status: AllianceSelectionStatus): Promise<TeamEntity[]> {
    return await Promise.all(status.remaining.map(async (team) => await this.teams.getTeam(team)))
  }
}

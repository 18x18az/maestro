// import { Injectable, Logger } from '@nestjs/common'
// import { PrismaService } from '../../../old_utils/prisma/prisma.service'
// import { TeamPublisher } from './team.broadcast'
// import { AGE_GROUP, Team, TeamInfo } from './team.interface'

// @Injectable()
// export class TeamService {
//   private readonly logger = new Logger(TeamService.name)

//   constructor (private readonly publisher: TeamPublisher, private readonly prisma: PrismaService) {
//   }

//   async onApplicationBootstrap (): Promise<void> {
//     const existing = await this.prisma.team.findMany()

//     if (existing.length === 0) {
//       return
//     }

//     this.logger.log(`Loaded ${existing.length} teams`)
//     const existingTeamInfo = existing.map(team => { return { number: team.number, name: team.name, city: team.city, state: team.state, country: team.country, ageGroup: team.ageGroup as AGE_GROUP } })
//     await this.broadcastTeamInfo(existingTeamInfo)
//   }

//   private async broadcastTeamInfo (teams: Team[]): Promise<void> {
//     const teamInfo: TeamInfo = {}
//     teams.forEach(team => { teamInfo[team.number] = team })
//     const teamList = teams.map(team => { return team.number })
//     const broadcastPromises = [
//       this.publisher.broadcastTeamList(teamList),
//       this.publisher.broadcastTeams(teamInfo)
//     ]
//     await Promise.all(broadcastPromises)
//   }

//   async createTeams (teams: Team[]): Promise<void> {
//     const existing = await this.prisma.team.findMany()
//     if (existing.length > 0) {
//       this.logger.warn(`Attempted to create teams, but ${existing.length} teams already exist`)
//       return
//     }
//     this.logger.log(`Creating ${teams.length} teams`)
//     const createPromises = teams.map(async (team) => {
//       await this.prisma.team.create({
//         data: {
//           name: team.name,
//           number: team.number,
//           city: team.city,
//           state: team.state,
//           country: team.country,
//           ageGroup: team.ageGroup
//         }
//       })
//     })

//     await Promise.all(createPromises)
//     await this.broadcastTeamInfo(teams)
//   }
// }

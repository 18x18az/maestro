import { Team as PrismaTeam } from '@prisma/client'
import { Team, AGE_GROUP } from '../team.interface'

export const mockTeams: Team[] = [
  { number: '1', name: 'Team 1', city: 'Tokyo', state: 'Tokyo', country: 'Japan', ageGroup: AGE_GROUP.HIGH_SCHOOL },
  { number: '127C', name: 'Lemon Bots', city: 'Gilbert', state: 'Arizona', country: 'United States', ageGroup: AGE_GROUP.HIGH_SCHOOL }
]

export function makeMockPrismaList (teams: PrismaTeam[]): Team[] {
  return teams.map(team => {
    const dbTeam: Team = {
      number: team.number,
      name: team.name,
      city: team.city,
      state: team.state,
      country: team.country,
      ageGroup: team.ageGroup as AGE_GROUP
    }
    return dbTeam
  })
}

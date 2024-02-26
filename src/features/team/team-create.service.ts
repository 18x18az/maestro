import { Injectable } from '@nestjs/common'
import { TeamListUpdateEvent } from './team-list-update.event'
import { TeamCreate } from './team.object'

@Injectable()
export class TeamCreateService {
  constructor (private readonly updateEvent: TeamListUpdateEvent) {}

  async handleUpload (data: string): Promise<void> {
    const teamsToCreate: TeamCreate[] = []

    const lines = data.split('\n').slice(1)

    for (const line of lines) {
      const values = line.split(',')
      const number = values[0]
      if (number === '') continue
      const name = values[1]
      const city = values[2]
      const school = values[6]

      const location = `${city}`

      teamsToCreate.push({ number, name, location, school })
    }

    await this.updateEvent.execute({ teams: teamsToCreate })
  }
}

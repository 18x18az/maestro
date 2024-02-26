import { Controller, Post, Request } from '@nestjs/common'
import { TeamService } from './team.service'

@Controller('teams')
export class TeamController {
  constructor (
    private readonly teams: TeamService
  ) {}

  @Post('quals')
  async uploadMatches (@Request() request): Promise<void> {
    const multipart = request.files()
    const file = await multipart.next()
    const buffer = await file.value.toBuffer()
    const string = buffer.toString('utf-8')
    await this.teams.handleUpload(string)
  }
}

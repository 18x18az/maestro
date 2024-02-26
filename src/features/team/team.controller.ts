import { Controller, Post, Request } from '@nestjs/common'
import { TeamCreateService } from './team-create.service'

@Controller('teams')
export class TeamController {
  constructor (
    private readonly createService: TeamCreateService
  ) {}

  @Post()
  async uploadTeams (@Request() request): Promise<void> {
    const multipart = request.files()
    const file = await multipart.next()
    const buffer = await file.value.toBuffer()
    const string = buffer.toString('utf-8')
    await this.createService.handleUpload(string)
  }
}

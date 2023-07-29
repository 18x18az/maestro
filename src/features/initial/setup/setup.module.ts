import { Module } from '@nestjs/common'
import { SetupController } from './setup.controller'
import { TeamModule } from '../team/team.module'

@Module({
  imports: [TeamModule],
  controllers: [SetupController]
})
export class SetupModule {}

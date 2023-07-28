import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { PublishModule } from 'src/utils/publish/publish.module';
import { PrismaModule } from 'src/utils/prisma/prisma.module';

@Module({
  imports: [PublishModule, PrismaModule],
  providers: [TeamService],
  exports: [TeamService]
})
export class TeamModule {}

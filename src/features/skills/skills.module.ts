import { Module } from '@nestjs/common'
import { FieldControlModule } from '../field-control'
import { FieldModule } from '../field'
import { SkillsController } from './skills.controller'
import { SkillsService } from './skills.service'
import { PublishModule } from '../../utils'
import { SkillsPublisher } from './skills.publisher'
import { StopSkillsEvent } from './stop-skills.event'

@Module({
  imports: [FieldControlModule, FieldModule, PublishModule],
  controllers: [SkillsController],
  providers: [SkillsService, SkillsPublisher, StopSkillsEvent],
  exports: [StopSkillsEvent]
})
export class SkillsModule {}

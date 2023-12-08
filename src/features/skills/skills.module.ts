import { Module } from '@nestjs/common'
import { FieldControlModule } from '../field-control'
import { FieldModule } from '../field'
import { SkillsController } from './skills.controller'
import { SkillsService } from './skills.service'
import { PublishModule } from '../../utils'
import { SkillsPublisher } from './skills.publisher'

@Module({
  imports: [FieldControlModule, FieldModule, PublishModule],
  controllers: [SkillsController],
  providers: [SkillsService, SkillsPublisher]
})
export class SkillsModule {}

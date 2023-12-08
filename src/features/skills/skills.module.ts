import { Module } from '@nestjs/common'
import { FieldControlModule } from '../field-control'
import { FieldModule } from '../field'
import { SkillsController } from './skills.controller'
import { SkillsService } from './skills.service'

@Module({
  imports: [FieldControlModule, FieldModule],
  controllers: [SkillsController],
  providers: [SkillsService]
})
export class SkillsModule {}

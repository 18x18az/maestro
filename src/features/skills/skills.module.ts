import { Module, forwardRef } from '@nestjs/common'
import { SkillsService } from './skills.service'
import { FieldModule } from '../field/field.module'
import { FieldControlModule } from '../field-control/field-control.module'
import { SkillsResolver } from './skills.resolver'

@Module({
  imports: [forwardRef(() => FieldControlModule), forwardRef(() => FieldModule)],
  providers: [SkillsService, SkillsResolver],
  exports: [SkillsService]
})
export class SkillsModule {}

import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SceneEntity } from './scene.entity'
import { SwitcherService } from './switcher.service'
import { SceneResolver } from './scene.resolver'
import { SwitcherInternal } from './switcher.internal'
import { CompetitionModule } from '../../competition/competition/competition.module'
import { FieldModule } from '../../field/field.module'
import { SolidDisplayModule } from '../solid-display/solid-display.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([SceneEntity]),
    CompetitionModule,
    FieldModule,
    forwardRef(() => SolidDisplayModule)
  ],
  providers: [SwitcherService, SceneResolver, SwitcherInternal],
  exports: [SwitcherService]
})

export class SwitcherModule {}

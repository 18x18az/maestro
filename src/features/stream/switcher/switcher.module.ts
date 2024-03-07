import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SceneEntity } from './scene.entity'
import { SwitcherService } from './switcher.service'
import { SceneResolver } from './scene.resolver'
import { SwitcherInternal } from './switcher.internal'

@Module({
  imports: [TypeOrmModule.forFeature([SceneEntity])],
  providers: [SwitcherService, SceneResolver, SwitcherInternal],
  exports: [SwitcherService]
})

export class SwitcherModule {}

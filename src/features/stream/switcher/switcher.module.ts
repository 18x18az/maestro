import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SceneEntity } from './scene.entity'
import { SwitcherService } from './switcher.service'

@Module({
  imports: [TypeOrmModule.forFeature([SceneEntity])],
  providers: [SwitcherService],
  exports: [SwitcherService]
})

export class SwitcherModule {}

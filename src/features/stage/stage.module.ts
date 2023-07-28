import { Module } from '@nestjs/common';
import { StageController } from './stage.controller';
import { StageService } from './stage.service';
import { StorageModule } from 'src/utils/storage/storage.module';
import { PublishModule } from 'src/utils/publish/publish.module';

@Module({
  imports: [StorageModule, PublishModule],
  controllers: [StageController],
  providers: [StageService]
})
export class StageModule {}

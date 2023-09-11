import { PigeonService } from 'pigeon-mqtt-nest'
import { WithoutPigeonModule } from './app.module'
import { Global, Module } from '@nestjs/common'

class MockPigeonService {
  async publish (topic: string, message: string): Promise<void> {
    console.log(`MockPigeonService.publish(${topic}, ${message})`)
  }
}

@Global()
@Module({
  imports: [
    WithoutPigeonModule
  ],
  providers: [{ provide: PigeonService, useClass: MockPigeonService }],
  exports: [PigeonService]
})

export class AppModule { }

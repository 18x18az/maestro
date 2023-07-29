import { Test, TestingModule } from '@nestjs/testing'
import { PublishService } from './publish.service'
import { PigeonService } from 'pigeon-mqtt-nest'

describe('PublishService', () => {
  const mockPigeonService = {
  }
  let service: PublishService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublishService, {
        provide: PigeonService,
        useValue: mockPigeonService
      }]
    }).compile()

    service = module.get<PublishService>(PublishService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

import { Test, TestingModule } from '@nestjs/testing'
import { PublishService } from './publish.service'
import { PigeonService } from 'pigeon-mqtt-nest'

describe('PublishService', () => {
  const mockPigeonService = {
    publish: jest.fn()
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

  describe('broadcast', () => {
    it('should call pigeonService.publish with the string representation of the provided payload', async () => {
      const topic = 'foo'
      const payload = { bar: 'baz' }

      await service.broadcast(topic, payload)

      expect(mockPigeonService.publish).toHaveBeenCalledWith({ topic, payload: JSON.stringify(payload), cmd: 'publish', retain: true, qos: 2 })
    })
  })
})

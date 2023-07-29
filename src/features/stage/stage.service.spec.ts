import { Test, TestingModule } from '@nestjs/testing'
import { StageService } from './stage.service'
import { StorageService } from 'src/utils/storage/storage.service'
import { PublishService } from 'src/utils/publish/publish.service'

describe('StageService', () => {
  let service: StageService

  const mockStorageService = {

  }

  const mockPublishService = {

  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StageService, { provide: StorageService, useValue: mockStorageService },
        StageService, { provide: PublishService, useValue: mockPublishService }
      ]
    }).compile()

    service = module.get<StageService>(StageService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

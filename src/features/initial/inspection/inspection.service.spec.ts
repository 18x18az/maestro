import { Test, TestingModule } from '@nestjs/testing'
import { InspectionService } from './inspection.service'
import { PublishService } from 'src/utils/publish/publish.service'
import { InspectionDatabase } from './repo.service'

describe('InspectionService', () => {
  let service: InspectionService

  const mockPublishService = {

  }

  const mockInspectionDatabase = {

  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InspectionService, {
          provide: PublishService,
          useValue: mockPublishService
        },
        InspectionService, {
          provide: InspectionDatabase,
          useValue: mockInspectionDatabase
        }
      ]
    }).compile()

    service = module.get<InspectionService>(InspectionService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

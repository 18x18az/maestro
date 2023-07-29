import { Test, TestingModule } from '@nestjs/testing'
import { TeamService } from './team.service'
import { PrismaService } from '../../../utils/prisma/prisma.service'
import { PublishService } from '../../../utils/publish/publish.service'

describe('TeamService', () => {
  let service: TeamService

  const mockPrismaService = {

  }

  const mockPublishService = {

  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService, {
          provide: PrismaService,
          useValue: mockPrismaService
        },
        TeamService, {
          provide: PublishService,
          useValue: mockPublishService
        }
      ]

    }).compile()

    service = module.get<TeamService>(TeamService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

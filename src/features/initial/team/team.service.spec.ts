import { Test, TestingModule } from '@nestjs/testing'
import { TeamService } from './team.service'
import { PrismaService } from '../../../utils/prisma/prisma.service'
import { PublishService } from '../../../utils/publish/publish.service'
import { makeMockPrismaList, mockTeams } from './__test__/mockTeams'
import { TeamInfo } from '@18x18az/rosetta'

describe('TeamService', () => {
  let service: TeamService

  const mockPrismaService = {
    team: {
      findMany: jest.fn(),
      create: jest.fn()
    }
  }

  const mockPublishService = {
    broadcast: jest.fn()
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

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('on startup', () => {
    it('should load the stored team list', async () => {
      const dbTeams = makeMockPrismaList(mockTeams)
      mockPrismaService.team.findMany.mockResolvedValue(dbTeams)

      await service.onApplicationBootstrap()

      expect(mockPrismaService.team.findMany).toHaveBeenCalled()
    })

    it('should broadcast the team list if it exists', async () => {
      const dbTeams = makeMockPrismaList(mockTeams)
      mockPrismaService.team.findMany.mockResolvedValue(dbTeams)

      await service.onApplicationBootstrap()

      expect(mockPublishService.broadcast).toHaveBeenCalled()
    })

    it('should not broadcast the team list if it does not exist', async () => {
      mockPrismaService.team.findMany.mockResolvedValue([])

      await service.onApplicationBootstrap()

      expect(mockPublishService.broadcast).not.toHaveBeenCalled()
    })
  })

  describe('on receiving a team list', () => {
    it('should save the team list', async () => {
      const mockDbEntries = makeMockPrismaList(mockTeams)

      await service.createTeams(mockTeams)

      expect(mockPrismaService.team.create).toHaveBeenCalledTimes(mockTeams.length)
      expect(mockPrismaService.team.create).toHaveBeenCalledWith({ data: mockDbEntries[0] })
      expect(mockPrismaService.team.create).toHaveBeenCalledWith({ data: mockDbEntries[1] })
    })

    it('should broadcast the team list', async () => {
      const expectedTeamInfo: TeamInfo = {}
      mockTeams.forEach(team => { expectedTeamInfo[team.number] = team })
      const expectedTeamList = mockTeams.map(team => { return team.number })

      await service.createTeams(mockTeams)

      expect(mockPublishService.broadcast).toHaveBeenCalledTimes(2)
      expect(mockPublishService.broadcast).toHaveBeenCalledWith('teamList', expectedTeamList)
      expect(mockPublishService.broadcast).toHaveBeenCalledWith('teams', expectedTeamInfo)
    })

    it('should not save the team list if it already exists', async () => {
      mockPrismaService.team.findMany.mockResolvedValue(makeMockPrismaList(mockTeams))

      await service.createTeams(mockTeams)

      expect(mockPrismaService.team.create).not.toHaveBeenCalled()
    })
  })
})

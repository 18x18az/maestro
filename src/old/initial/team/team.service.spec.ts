import { Test, TestingModule } from '@nestjs/testing'
import { TeamService } from './team.service'
import { PrismaService } from '../../../old_utils/prisma/prisma.service'
import { makeMockPrismaList, mockTeams } from './__test__/mockTeams'
import { TeamInfo } from './team.interface'
import { TeamPublisher } from './team.broadcast'

describe('TeamService', () => {
  let service: TeamService

  const mockPrismaService = {
    team: {
      findMany: jest.fn(),
      create: jest.fn()
    }
  }

  const mockTeamPublisher = {
    broadcastTeams: jest.fn(),
    broadcastTeamList: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService, {
          provide: PrismaService,
          useValue: mockPrismaService
        },
        TeamService, {
          provide: TeamPublisher,
          useValue: mockTeamPublisher
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

      expect(mockTeamPublisher.broadcastTeams).toHaveBeenCalled()
    })

    it('should not broadcast the team list if it does not exist', async () => {
      mockPrismaService.team.findMany.mockResolvedValue([])

      await service.onApplicationBootstrap()

      expect(mockTeamPublisher.broadcastTeams).not.toHaveBeenCalled()
      expect(mockTeamPublisher.broadcastTeamList).not.toHaveBeenCalled()
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

      expect(mockTeamPublisher.broadcastTeams).toHaveBeenCalledWith(expectedTeamInfo)
      expect(mockTeamPublisher.broadcastTeamList).toHaveBeenCalledWith(expectedTeamList)
    })

    it('should not save the team list if it already exists', async () => {
      mockPrismaService.team.findMany.mockResolvedValue(makeMockPrismaList(mockTeams))

      await service.createTeams(mockTeams)

      expect(mockPrismaService.team.create).not.toHaveBeenCalled()
    })
  })
})

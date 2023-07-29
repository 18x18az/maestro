import { Test, TestingModule } from '@nestjs/testing'
import { InspectionDatabase, InspectionRollup } from './repo.service'
import { PrismaService } from 'src/utils/prisma/prisma.service'
import { InMemoryDBService } from '@nestjs-addons/in-memory-db'
import { INSPECTION_STAGE } from '@18x18az/rosetta'

function generateCache(): InspectionRollup {
    return {
        id: '1',
        team: '1',
        status: INSPECTION_STAGE.NOT_HERE
    }
}

describe('InspectionDatabase', () => {
  const mockPrismaService = {
    team: {
      findUnique: jest.fn()
    },
    checkIn: {
      upsert: jest.fn(),
      findUnique: jest.fn()
    },
    checkedInspection: {
        count: jest.fn(),
        create: jest.fn(), 
        delete: jest.fn()
    },
    inspectionCriteria: {
        count: jest.fn()
    },
    inspectionGroup: {
        findMany: jest.fn()
    }
  }

  const mockInMemoryDBService = {
    get: jest.fn(),
    getAll: jest.fn(),
    update: jest.fn(),
    create: jest.fn()
  }

  let repo: InspectionDatabase
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InspectionDatabase, {
          provide: PrismaService,
          useValue: mockPrismaService
        },
        InspectionDatabase, {
          provide: InMemoryDBService,
          useValue: mockInMemoryDBService
        }
      ]
    }).compile()

    const cached = generateCache()
    mockInMemoryDBService.get.mockReturnValue(cached)

    repo = module.get<InspectionDatabase>(InspectionDatabase)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should be defined', () => {
    expect(repo).toBeDefined()
  })

  describe('getCriteriaMet', () => {
    it('should get all criteria met for a team', async () => {
      const mockTeamResult = {
        checkedPoints: jest.fn()
      }
      mockTeamResult.checkedPoints.mockReturnValue([])
      mockPrismaService.team.findUnique.mockReturnValue(mockTeamResult)

      await repo.getCriteriaMet('1')

      expect(mockPrismaService.team.findUnique).toHaveBeenCalledWith({ where: { number: '1' } })
      expect(mockTeamResult.checkedPoints).toHaveBeenCalled()
    })

    it('should return the met criteria IDs', async () => {
      const mockReturn = [{ criteriaId: 1 }, { criteriaId: 2 }]

      const mockTeamResult = {
        checkedPoints: jest.fn()
      }
      mockTeamResult.checkedPoints.mockReturnValue(mockReturn)
      mockPrismaService.team.findUnique.mockReturnValue(mockTeamResult)

      const result = await repo.getCriteriaMet('1')

      expect(result).toEqual([1, 2])
    })
  })

  describe('markCheckinStage', () => {
    describe('when the stage is changed', () => {
      it('should store the updated stage', async () => {
        const stage = INSPECTION_STAGE.NO_SHOW

        await repo.markCheckinStage('1', stage)

        expect(mockPrismaService.checkIn.upsert).toHaveBeenCalledWith({ where: { teamNumber: '1' }, update: { status: stage }, create: { teamNumber: '1', status: stage } })
      })

      it('should update the rollup', async () => {
        const stage = INSPECTION_STAGE.NO_SHOW
        const existing = generateCache()

        await repo.markCheckinStage('1', stage)

        expect(mockInMemoryDBService.update).toHaveBeenCalledWith({ ...existing, status: stage })
      })

      it('should return the updated stage', async () => {
        const stage = INSPECTION_STAGE.NO_SHOW

        const result = await repo.markCheckinStage('1', stage)

        expect(result).toEqual(stage)
      })
    })
    describe('when a team is marked as checked in', () => {
        it('should evaluate inspection progress', async () => {
            mockPrismaService.inspectionCriteria.count.mockReturnValue(2)
            mockPrismaService.checkedInspection.count.mockReturnValue(1)
            const stage = INSPECTION_STAGE.CHECKED_IN

            const result = await repo.markCheckinStage('1', stage)

            expect(mockPrismaService.inspectionCriteria.count).toHaveBeenCalled()
            expect(mockPrismaService.checkedInspection.count).toHaveBeenCalled()

            expect(result).toEqual(INSPECTION_STAGE.PARTIAL)
        })
    })
  })

  describe('markMetOrNot', () => {
    it('should add a met criteria', async () => {
      await repo.markMetOrNot('1', 1, true)

      expect(mockPrismaService.checkedInspection.create).toHaveBeenCalledWith({ data: { teamNumber: '1', criteriaId: 1 } })
    })

    it('should delete a not met criteria', async () => {
        await repo.markMetOrNot('1', 1, false)

        expect(mockPrismaService.checkedInspection.delete).toHaveBeenCalledWith({ where: { teamNumber_criteriaId: { teamNumber: '1', criteriaId: 1 } } })
    })
    
    it('should update the rollup', async () => {
        mockPrismaService.inspectionCriteria.count.mockReturnValue(2)
        mockPrismaService.checkedInspection.count.mockReturnValue(1)
        await repo.markMetOrNot('1', 1, true)

        const existing = generateCache()

        expect(mockInMemoryDBService.update).toHaveBeenCalledWith({ ...existing, status: INSPECTION_STAGE.PARTIAL })
    })

    it('should return the updated stage', async () => {
        mockPrismaService.inspectionCriteria.count.mockReturnValue(2)
        mockPrismaService.checkedInspection.count.mockReturnValue(1)
        const result = await repo.markMetOrNot('1', 1, true)

        expect(result).toEqual(INSPECTION_STAGE.PARTIAL)

    })

    it('should return CHECKED_IN if no criteria are met', async () => {
        mockPrismaService.inspectionCriteria.count.mockReturnValue(2)
        mockPrismaService.checkedInspection.count.mockReturnValue(0)

        const result = await repo.markMetOrNot('1', 1, false)

        expect(result).toEqual(INSPECTION_STAGE.CHECKED_IN)
    })

    it('should return PARTIAL if some criteria are met', async () => {
        mockPrismaService.inspectionCriteria.count.mockReturnValue(2)
        mockPrismaService.checkedInspection.count.mockReturnValue(1)

        const result = await repo.markMetOrNot('1', 1, false)

        expect(result).toEqual(INSPECTION_STAGE.PARTIAL)
    })

    it('should return COMPLETE if all criteria are met', async () => {
        mockPrismaService.inspectionCriteria.count.mockReturnValue(2)
        mockPrismaService.checkedInspection.count.mockReturnValue(2)

        const result = await repo.markMetOrNot('1', 1, true)

        expect(result).toEqual(INSPECTION_STAGE.COMPLETE)
    })
  })

  describe('getTeamsByStage', () => {
    it('should return a list of teams in a stage', () => {
        const mockAllTeams = [
            { id: '1', team: '1', status: INSPECTION_STAGE.NOT_HERE },
            { id: '2', team: '2', status: INSPECTION_STAGE.PARTIAL },
        ]
        mockInMemoryDBService.getAll.mockReturnValue(mockAllTeams)

        const result = repo.getTeamsByStage(INSPECTION_STAGE.NOT_HERE)

        expect(result).toEqual(['1'])
    })
  })

  describe('getInspectionChecklist', () => {
    it('should return a list of criteria', async () => {
        const criteria = [{ text: 'foo', id: '1' }, {text: 'bar', id: '2'}]
        const groups = [{criteria, name: 'test'}]
        mockPrismaService.inspectionGroup.findMany.mockReturnValue(groups)
        const result = await repo.getInspectionChecklist()

        const output = {test: [{text: 'foo', uuid: '1'}, {text: 'bar', uuid: '2'}]}
        expect(result).toEqual(output)
    })
  });

  describe('evaluateInspectionProgress', () => {
    it('should get the current inspection progress of a team', async () => {
        mockPrismaService.inspectionCriteria.count.mockReturnValue(2)
        mockPrismaService.checkedInspection.count.mockReturnValue(1)

        const result = await repo.evaluateInspectionProgress('1')

        expect(result).toEqual(INSPECTION_STAGE.PARTIAL)
    })
  })

  describe('on initial load', () => {
    it('should read the value from the database', async () => {
        await repo.initialLoad('1')

        expect(mockPrismaService.checkIn.findUnique).toHaveBeenCalledWith({ where: { teamNumber: '1' } })
    })

    it('should return the loaded value', async () => {
        mockPrismaService.checkIn.findUnique.mockResolvedValueOnce({status: INSPECTION_STAGE.NO_SHOW})

        const result = await repo.initialLoad('1')

        expect(result).toEqual(INSPECTION_STAGE.NO_SHOW)
    })

    it('should default to NOT_HERE', async () => {
        const result = await repo.initialLoad('1')

        expect(result).toEqual(INSPECTION_STAGE.NOT_HERE)
    })

    it('should create a new cached rollup', async () => {
        await repo.initialLoad('1')

        expect(mockInMemoryDBService.create).toHaveBeenCalledWith({ id: '1', team: '1', status: INSPECTION_STAGE.NOT_HERE })
    })

    it('should parse inspection progress if the team is checked in', async () => {
        mockPrismaService.checkIn.findUnique.mockResolvedValueOnce({status: INSPECTION_STAGE.CHECKED_IN})
        mockPrismaService.inspectionCriteria.count.mockReturnValue(2)
        mockPrismaService.checkedInspection.count.mockReturnValue(1)

        const result = await repo.initialLoad('1')

        expect(result).toEqual(INSPECTION_STAGE.PARTIAL)
    })
  })

  describe('getStage', () => {
    it('should return the stage', () => {
        const result = repo.getStage('1')

        expect(result).toEqual(INSPECTION_STAGE.NOT_HERE)
    });
  })
})

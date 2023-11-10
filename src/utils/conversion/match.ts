import { Match, MatchStatus, Round } from '@/features'
import { Prisma } from '@prisma/client'

type PrismaMatchInfo = Prisma.MatchGetPayload<{ include: { block: true, field: true } }>

export function parseMatch (match: PrismaMatchInfo): Match {
  return {
    id: match.id,
    number: match.number,
    red: {
      team1: match.red1,
      team2: match.red2 !== undefined ? match.red2 : undefined
    },
    blue: {
      team1: match.blue1,
      team2: match.blue2 !== undefined ? match.blue2 : undefined
    },
    fieldId: match.fieldId !== null ? match.fieldId : undefined,
    fieldName: (match.field != null) ? match.field.name : undefined,
    status: match.status as MatchStatus,
    block: match.block.name,
    round: match.round as Round,
    sitting: match.sitting,
    time: match.time !== null ? match.time : undefined
  }
}

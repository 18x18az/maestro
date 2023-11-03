import { Injectable } from '@nestjs/common'
import { TmInternal } from './tm.internal'
import { Alliance, MatchIdentifier, Round } from '@/features'
import { ElimsMatch, MatchResult, TmReturn } from './tm.interface'

@Injectable()
export class TmService {
  constructor (
    private readonly service: TmInternal
  ) { }

  async getRankings (): Promise<string[]> {
    const rawRankings = await this.service.getTableData('division1/rankings')

    if (rawRankings === null) {
      return []
    }

    return rawRankings.flatMap((row) => {
      const cells = row.querySelectorAll('td')
      if (cells[0] === undefined) {
        return []
      }

      const team = cells[1].rawText
      return team
    })
  }

  async getMatchResults (): Promise<TmReturn> {
    const rawMatches = await this.service.getTableData('division1/matches')

    if (rawMatches === null) {
      return {
        matches: [],
        results: []
      }
    }

    const results: MatchResult[] = []
    const matches: ElimsMatch[] = []

    rawMatches.forEach((row) => {
      const cells = row.querySelectorAll('td')
      if (cells[0] === undefined) {
        return []
      }
      const matchName = cells[0].rawText

      let round = Round.QUAL
      if (matchName.startsWith('R16')) {
        round = Round.Ro16
      } else if (matchName.startsWith('QF')) {
        round = Round.QF
      } else if (matchName.startsWith('SF')) {
        round = Round.SF
      } else if (matchName.startsWith('F')) {
        round = Round.F
      }

      let matchNumber: number = 0
      let matchSitting: number = 0
      if (round === Round.QUAL) {
        matchNumber = parseInt(matchName.substring(1))
      } else if (round === Round.F) {
        matchNumber = 1
        matchSitting = parseInt(matchName.split(' ')[1])
      } else {
        const info = matchName.split(' ')[1]
        const parts = info.split('-')
        matchNumber = parseInt(parts[0])
        matchSitting = parseInt(parts[1])
      }

      const red: Alliance = {
        team1: cells[1].rawText,
        team2: cells[2].rawText
      }
      const blue: Alliance = {
        team1: cells[3].rawText,
        team2: cells[4].rawText
      }

      const identifier: MatchIdentifier = {
        round,
        matchNum: matchNumber,
        sitting: matchSitting

      }

      const redScore = parseInt(cells[5].rawText)
      const blueScore = parseInt(cells[6].rawText)

      if (redScore !== 0 || blueScore !== 0) {
        results.push({
          identifier,
          redScore,
          blueScore
        })
      }

      if (identifier.round !== Round.QUAL) {
        matches.push({
          identifier,
          red,
          blue
        })
      }
    })

    return {
      matches,
      results
    }
  }
}

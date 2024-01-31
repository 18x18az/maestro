import { Injectable } from '@nestjs/common'
import { TmInternal } from './tm.internal'
import { AwardResult, ElimsMatch, MatchResult, TeamCheckin, TmReturn } from './tm.interface'
import { Round } from '../../features/competition/match/match.interface'
import { getAlliance, getMatchIdent } from './match-parser'

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

  async getAwards (): Promise<AwardResult[] | null> {
    const raw = await this.service.getTableData('division1/awards')

    if (raw === null) {
      return null
    }

    const awards: AwardResult[] = []

    raw.forEach((row) => {
      const cells = row.querySelectorAll('td')
      if (cells[0] === undefined) {
        return []
      }

      const name = cells[0].rawText
      const selectionInfo = cells[1].childNodes[1]

      const winnerNode = selectionInfo.childNodes.find((node) => {
        return node.toString().includes('selected')
      })

      const winner = winnerNode?.rawText

      // if award already exists, add winner to list, otherwise create new award
      const existingAward = awards.find((award) => award.name === name)
      if (existingAward !== undefined) {
        if (winner !== undefined) {
          existingAward.winners.push(winner)
        }
      } else {
        awards.push({
          name,
          winners: winner !== undefined ? [winner] : []
        })
      }
    })

    return awards
  }

  async submitCheckin (team: string, value: boolean): Promise<void> {
    const data = {
      teamnum: team,
      checkedIn: value ? 1 : 0
    }

    await this.service.sendJson(`admin/checkin/${team}`, data)
  }

  async getCheckinStatuses (): Promise<TeamCheckin[]> {
    const raw = await this.service.getTableData('admin/checkin/summary')

    if (raw === null) {
      throw new Error('Could not get checkin statuses')
    }

    const results = raw.flatMap((row) => {
      const cells = row.querySelectorAll('td')
      if (cells[0] === undefined) {
        return []
      }

      const team = cells[0].rawText
      const status = cells[1].rawText.includes('Yes')

      return { team, status }
    })

    return results
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
      const identifier = getMatchIdent(matchName)

      const red = getAlliance(cells, 1)
      const blue = getAlliance(cells, 3)

      const redScore = parseInt(cells[5].rawText)
      const blueScore = parseInt(cells[6].rawText)

      // log a warning and return if the score is NaN
      if (isNaN(redScore) || isNaN(blueScore)) {
        return
      }

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

import { Injectable } from '@nestjs/common'
import { TmInternal } from './tm.internal'
import { AwardResult, ElimsMatch, MatchIdentifier, MatchResult, TeamCheckin, TmReturn } from './tm.interface'
import { Alliance, Round } from '../../features/competition/match/match.interface'

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

      let contestNumber: number = 0
      let matchNumber: number = 1
      if (round === Round.QUAL) {
        contestNumber = parseInt(matchName.substring(1))
      } else if (round === Round.F) {
        contestNumber = 1
        matchNumber = parseInt(matchName.split(' ')[1])
      } else {
        const info = matchName.split(' ')[1]
        const parts = info.split('-')
        contestNumber = parseInt(parts[0])
        matchNumber = parseInt(parts[1])
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
        contest: contestNumber,
        match: matchNumber

      }

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

import { Tier, Winner } from './match.interface'
import { calculateScore, makeCalculableScore, makeEmptyScore } from './score.calc'

describe('calculateScore', () => {
  it('should return 0 for a base match', () => {
    const score = makeEmptyScore(1, false, [1, 2], [3, 4])

    const calculable = makeCalculableScore(score)
    const result = calculateScore(calculable.red)

    expect(result).toBe(0)
  })

  it('should award 8 points for winning auto', () => {
    const score = makeEmptyScore(1, false, [1, 2], [3, 4])

    score.autoWinner = Winner.RED

    const calculable = makeCalculableScore(score)
    const result = calculateScore(calculable.red)

    expect(result).toBe(8)
  })

  it('should award 4 points for tying auto', () => {
    const score = makeEmptyScore(1, false, [1, 2], [3, 4])

    score.autoWinner = Winner.TIE

    const calculable = makeCalculableScore(score)
    const result = calculateScore(calculable.red)

    expect(result).toBe(4)
  })

  it('should award 0 points for losing auto', () => {
    const score = makeEmptyScore(1, false, [1, 2], [3, 4])

    score.autoWinner = Winner.BLUE

    const calculable = makeCalculableScore(score)
    const result = calculateScore(calculable.red)

    expect(result).toBe(0)
  })

  it('should award no points if there is no auto winner', () => {
    const score = makeEmptyScore(1, false, [1, 2], [3, 4])

    score.autoWinner = Winner.NONE

    const calculable = makeCalculableScore(score)
    const result = calculateScore(calculable.red)

    expect(result).toBe(0)
  })

  it('should award 5 points for each alliance ball in goal', () => {
    const score = makeEmptyScore(1, false, [1, 2], [3, 4])

    score.red.allianceInGoal = 2

    const calculable = makeCalculableScore(score)
    const result = calculateScore(calculable.red)

    expect(result).toBe(10)
  })

  it('should award 5 points for each ball in goal', () => {
    const score = makeEmptyScore(1, false, [1, 2], [3, 4])

    score.red.allianceInGoal = 2

    const calculable = makeCalculableScore(score)
    const result = calculateScore(calculable.red)

    expect(result).toBe(10)
  })

  it('should award 2 points for each alliance ball in zone', () => {
    const score = makeEmptyScore(1, false, [1, 2], [3, 4])

    score.red.allianceInZone = 2

    const calculable = makeCalculableScore(score)
    const result = calculateScore(calculable.red)

    expect(result).toBe(4)
  })

  it('should award 2 points for each ball in zone', () => {
    const score = makeEmptyScore(1, false, [1, 2], [3, 4])

    score.red.allianceInZone = 2

    const calculable = makeCalculableScore(score)
    const result = calculateScore(calculable.red)

    expect(result).toBe(4)
  })

  it('should award 20 points if a robot is the highest tier', () => {
    const score = makeEmptyScore(1, false, [1, 2], [3, 4])

    score.red.robot1Tier = Tier.B

    score.blue.robot1Tier = Tier.A
    score.blue.robot2Tier = Tier.A

    const calculable = makeCalculableScore(score)
    const result = calculateScore(calculable.red)

    expect(result).toBe(20)
  })

  it('should award 20 points if a robot is tied for the highest tier', () => {
    const score = makeEmptyScore(1, false, [1, 2], [3, 4])

    score.red.robot1Tier = Tier.B

    score.blue.robot1Tier = Tier.A
    score.blue.robot2Tier = Tier.B

    const calculable = makeCalculableScore(score)
    const result = calculateScore(calculable.red)

    expect(result).toBe(20)
  })

  it('should award 15 points if a robot is the second highest tier', () => {
    const score = makeEmptyScore(1, false, [1, 2], [3, 4])

    score.red.robot1Tier = Tier.A

    score.blue.robot1Tier = Tier.A
    score.blue.robot2Tier = Tier.B

    const calculable = makeCalculableScore(score)
    const result = calculateScore(calculable.red)

    expect(result).toBe(15)
  })

  it('should award 15 points if a robot is behind two tied robots', () => {
    const score = makeEmptyScore(1, false, [1, 2], [3, 4])

    score.red.robot1Tier = Tier.A

    score.blue.robot1Tier = Tier.B
    score.blue.robot2Tier = Tier.B

    const calculable = makeCalculableScore(score)
    const result = calculateScore(calculable.red)

    expect(result).toBe(15)
  })

  it('should award 10 points if a robot is the third highest tier', () => {
    const score = makeEmptyScore(1, false, [1, 2], [3, 4])

    score.red.robot1Tier = Tier.A

    score.blue.robot1Tier = Tier.B
    score.blue.robot2Tier = Tier.C

    const calculable = makeCalculableScore(score)
    const result = calculateScore(calculable.red)

    expect(result).toBe(10)
  })

  it('should award 15 points if the two alliance robots are at the two lowest tiers', () => {
    const score = makeEmptyScore(1, false, [1, 2], [3, 4])

    score.red.robot1Tier = Tier.A
    score.red.robot2Tier = Tier.B

    score.blue.robot1Tier = Tier.C
    score.blue.robot2Tier = Tier.D

    const calculable = makeCalculableScore(score)
    const result = calculateScore(calculable.red)

    expect(result).toBe(15)
  })
})

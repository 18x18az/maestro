import {
  ApiProperty,
  IntersectionType,
  OmitType,
  PartialType,
  PickType
} from '@nestjs/swagger'
import { IsEnum, IsInt, IsJSON, Max, Min, ValidateNested } from 'class-validator'
import { RecursivePartial } from 'src/utils/recursivePartial'
import { RecursiveRequired } from 'src/utils/recursiveRequired'

// declare function ObjectToStringType<T>(
//   classRef: Type<T>
// ): Type<{ [K in keyof T]: T[K] extends object ? string : T[K] }>;

enum ELEVATION {
  NONE = 'none',
  A = 'a',
  B = 'b',
  C = 'c',
  D = 'd',
  E = 'e',
  F = 'f',
  G = 'g',
  H = 'h',
}

export class AllianceScore {
  @IsInt()
  @ApiProperty({
    description: "Number of balls in the alliance's goal",
    example: 3
  })
    goalTriballs: number

  @IsInt()
  @ApiProperty({
    description: "Number of balls in the alliance's offensive zone",
    example: 3
  })
    zoneTriballs: number

  @Min(0)
  @Max(2)
  @IsInt()
  @ApiProperty({
    description: "Number of alliance's triballs in either goal",
    example: 1
  })
    allianceTriballsInGoal: number

  @Min(0)
  @Max(2)
  @IsInt()
  @ApiProperty({
    description: "Number of alliance's triballs in either offensive zone",
    example: 1
  })
    allianceTriballsInZone: number

  @IsEnum(ELEVATION)
  @ApiProperty({
    description: 'Elevation level of the first robot on the alliance',
    example: ELEVATION.B,
    enum: ELEVATION,
    enumName: 'ELEVATION'
  })
    robot1Tier: ELEVATION

  @IsEnum(ELEVATION)
  @ApiProperty({
    description: 'Elevation level of the second robot on the alliance',
    example: ELEVATION.B,
    enum: ELEVATION,
    enumName: 'ELEVATION'
  })
    robot2Tier: ELEVATION
}

export enum AUTON_WINNER {
  RED = 'red',
  BLUE = 'blue',
  TIE = 'tie',
  NONE = 'none',
}

export class MatchScore {
  @ValidateNested()
  @ApiProperty({ description: 'Red team raw score', type: AllianceScore })
    redScore: AllianceScore

  @ValidateNested()
  @ApiProperty({ description: 'Blue team raw score', type: AllianceScore })
    blueScore: AllianceScore

  @IsEnum(AUTON_WINNER)
  @ApiProperty({
    description: 'Auton winner',
    example: AUTON_WINNER.RED,
    enum: AUTON_WINNER
  })
    autonWinner: AUTON_WINNER

  @ApiProperty({
    description:
      'Prevents modification when locked and prevents saving to DB when unlocked',
    example: false
  })
    locked: boolean
}
class PartialAllianceScore extends PartialType(AllianceScore) {};
class PartialAllianceMatchScore {
  @ValidateNested()
  @ApiProperty({
    description: 'Red team raw score',
    type: PartialAllianceScore
  })
    redScore?: PartialAllianceScore

  @ValidateNested()
  @ApiProperty({
    description: 'Blue team raw score',
    type: PartialAllianceScore
  })
    blueScore?: PartialAllianceScore
}

export class RecursivePartialMatchScore extends IntersectionType(
  PartialAllianceMatchScore,
  PartialType(OmitType(MatchScore, ['redScore', 'blueScore'] as const))
) {}

// export type MatchScoreUpdate = RecursivePartial<Omit<MatchScore, 'locked'>>
export class MatchScoreUpdate extends OmitType(RecursivePartialMatchScore, [
  'locked'
] as const) {}

class IdForMatchScoreInMemory {
  @ApiProperty()
    id: string
}
export class MatchScoreInMemory extends IntersectionType(
  MatchScoreUpdate,
  IdForMatchScoreInMemory,
  PickType(MatchScore, ['locked'] as const)
) {}
export class FullMatchScoreInMemory extends IntersectionType(
  MatchScore,
  IdForMatchScoreInMemory
) {}
// export type MatchScoreInMemory = { id: string } & RecursivePartial<
// Omit<MatchScore, 'locked'>
// > &
// Pick<MatchScore, 'locked'>
class IdsForMatchScoreInPrisma {
  @ApiProperty()
    scoreId: number

  @ApiProperty()
    matchId: number
}
class SerializedAllianceScoreMatchScore {
  @IsJSON()
  @ApiProperty({
    description: 'Blue team raw score'
  })
    redScore: string

  @IsJSON()
  @ApiProperty({
    description: 'Blue team raw score'
  })
    blueScore: string
}
export class MatchScoreInPrisma extends IntersectionType(
  SerializedAllianceScoreMatchScore,
  OmitType(MatchScore, ['locked', 'redScore', 'blueScore'] as const),
  IdsForMatchScoreInPrisma
) {}
// export type MatchScoreInPrisma = { scoreId: number; matchId: number } & {
//   [K in keyof Omit<MatchScore, "locked">]: MatchScore[K] extends string
//     ? MatchScore[K]
//     : string;
// };

// ---------------------------
//        Type Checks
// ---------------------------

// checks stuff ig: https://stackoverflow.com/a/57594451
type MutuallyAssignable<T extends U, U extends V, V = T> = true

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _CheckRecursivePartialMatchScore = MutuallyAssignable<
RecursivePartialMatchScore,
RecursivePartial<MatchScore>
>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _CheckFullMatchScoreInMemory = MutuallyAssignable<
FullMatchScoreInMemory,
RecursiveRequired<MatchScoreInMemory>
>

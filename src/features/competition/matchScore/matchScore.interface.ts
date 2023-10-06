import {
  ApiProperty,
  IntersectionType,
  OmitType,
  PartialType
} from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsJSON,
  IsPositive,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested
} from 'class-validator'
import { RecursivePartial } from 'src/utils/recursivePartial'
import { RecursiveRequired } from 'src/utils/recursiveRequired'

// declare function ObjectToStringType<T>(
//   classRef: Type<T>
// ): Type<{ [K in keyof T]: T[K] extends object ? string : T[K] }>;
export enum MATCH_ROUND {
  QUALIFICATION = 'qual',
  ELIMINATION = 'elim'
}

export interface MatchDetails {
  matchId: number
  round: string
}

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
enum TEAM_METADATA {
  NONE = 'none',
  NO_SHOW = 'no_show',
  DISQUALIFIED = 'disqualified',
}
/** This should be completely independent of the current game */
class AllianceMetadata {
  @IsEnum(TEAM_METADATA)
  @ApiProperty({
    description: 'Whether the first team no-show-ed or dq-ed in the match',
    example: 'none',
    enum: TEAM_METADATA,
    default: 'none'
  })
    team1: TEAM_METADATA

  @ValidateIf(
    (meta: AllianceMetadata) =>
      meta.team1 === meta.team2 ||
      (meta.team1 !== TEAM_METADATA.DISQUALIFIED &&
        meta.team2 !== TEAM_METADATA.DISQUALIFIED),
    { groups: ['meta.elim'] }
  )
  @IsEnum(TEAM_METADATA)
  @ApiProperty({
    description: 'Whether the first team no-show-ed or dq-ed in the match',
    example: 'none',
    enum: TEAM_METADATA,
    default: 'none'
  })
    team2: TEAM_METADATA

  @IsBoolean({ groups: ['meta.qual'] })
  @ApiProperty({
    description: 'Whether the alliance was awarded the Autonomous Win Point',
    example: false,
    default: false
  })
    autonWinPoint: boolean
}
export class MatchScoreMetadata {
  @ValidateNested()
  @Type(() => AllianceMetadata)
  @ApiProperty({ description: "Red's metadata", type: AllianceMetadata })
    red: AllianceMetadata

  @ValidateNested()
  @Type(() => AllianceMetadata)
  @ApiProperty({ description: "Blue's metadata", type: AllianceMetadata })
    blue: AllianceMetadata
}
export class AllianceScore {
  @Max(56) // Total Triballs (60) - Alliance Triballs (4)
  @Min(0)
  @IsInt()
  @ApiProperty({
    description: "Number of balls in the alliance's goal",
    example: 3,
    default: 0
  })
    goalTriballs: number

  // Check that triballs total is at max 56
  @ValidateIf(({ zoneTriballs, goalTriballs }: AllianceScore) => (goalTriballs + zoneTriballs) <= 56)
  @Max(56) // Total Triballs (60) - Alliance Triballs (4)
  @Min(0)
  @IsInt()
  @ApiProperty({
    description: "Number of balls in the alliance's offensive zone",
    example: 3,
    default: 0
  })
    zoneTriballs: number

  @Min(0)
  @Max(2)
  @IsInt()
  @ApiProperty({
    description: "Number of alliance's triballs in either goal",
    example: 1,
    default: 0
  })
    allianceTriballsInGoal: number

  // Check that allianceTriballs total is at max 2
  @ValidateIf(({ allianceTriballsInGoal, allianceTriballsInZone }: AllianceScore) => (allianceTriballsInGoal + allianceTriballsInZone) <= 2)
  @Min(0)
  @Max(2)
  @IsInt()
  @ApiProperty({
    description: "Number of alliance's triballs in either offensive zone",
    example: 1,
    default: 0
  })
    allianceTriballsInZone: number

  @IsEnum(ELEVATION)
  @ApiProperty({
    description: 'Elevation level of the first robot on the alliance',
    example: ELEVATION.B,
    enum: ELEVATION,
    enumName: 'ELEVATION',
    default: 'none'
  })
    robot1Tier: ELEVATION

  @IsEnum(ELEVATION)
  @ApiProperty({
    description: 'Elevation level of the second robot on the alliance',
    example: ELEVATION.B,
    enum: ELEVATION,
    enumName: 'ELEVATION',
    default: 'none'
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
  @Type(() => AllianceScore)
  @ApiProperty({ description: 'Red team raw score', type: AllianceScore })
    redScore: AllianceScore

  @ValidateNested()
  @Type(() => AllianceScore)
  @ApiProperty({ description: 'Blue team raw score', type: AllianceScore })
    blueScore: AllianceScore

  @ValidateNested()
  @Type(() => MatchScoreMetadata)
  @ApiProperty({ description: 'Data about the match that is independent of the current game', type: MatchScoreMetadata })
    metadata: MatchScoreMetadata

  @IsEnum(AUTON_WINNER)
  @ApiProperty({
    description: 'Auton winner',
    example: AUTON_WINNER.RED,
    enum: AUTON_WINNER,
    default: 'none'
  })
    autonWinner: AUTON_WINNER

  @IsBoolean()
  @ApiProperty({
    description:
      'Prevents modification when locked and prevents saving to DB when unlocked',
    example: false,
    default: false
  })
    locked: boolean
}

class DefaultAllianceScore extends AllianceScore {
  goalTriballs: number = 0
  zoneTriballs: number = 0
  allianceTriballsInGoal: number = 0
  allianceTriballsInZone: number = 0
  robot1Tier: ELEVATION = ELEVATION.NONE
  robot2Tier: ELEVATION = ELEVATION.NONE
}
class DefaultAllianceMetadata extends AllianceMetadata {
  team1: TEAM_METADATA = TEAM_METADATA.NONE
  team2: TEAM_METADATA = TEAM_METADATA.NONE
  autonWinPoint: boolean = false
}
class DefaultMatchScoreMetadata extends MatchScoreMetadata {
  red: AllianceMetadata = new DefaultAllianceMetadata()
  blue: AllianceMetadata = new DefaultAllianceMetadata()
}

export class DefaultMatchScore extends MatchScore {
  redScore: AllianceScore = new DefaultAllianceScore()
  blueScore: AllianceScore = new DefaultAllianceScore()
  metadata: MatchScoreMetadata = new DefaultMatchScoreMetadata()
  autonWinner: AUTON_WINNER = AUTON_WINNER.NONE
  locked: boolean = false
}

class PartialAllianceScore extends PartialType(AllianceScore) {}
class PartialAllianceMetadata extends PartialType(AllianceMetadata) {}

class PartialMatchScoreMetadata {
  @ValidateNested()
  @Type(() => PartialAllianceMetadata)
  @ApiProperty({ description: "Red's metadata", type: PartialAllianceMetadata })
    red?: PartialAllianceMetadata

  @ValidateNested()
  @Type(() => PartialAllianceMetadata)
  @ApiProperty({ description: "Blue's metadata", type: PartialAllianceMetadata })
    blue?: PartialAllianceMetadata
}
class PartialAllianceMatchScore {
  @ValidateNested()
  @Type(() => PartialAllianceScore)
  @ApiProperty({
    description: 'Red team raw score',
    type: PartialAllianceScore
  })
    redScore?: PartialAllianceScore

  @ValidateNested()
  @Type(() => PartialAllianceScore)
  @ApiProperty({
    description: 'Blue team raw score',
    type: PartialAllianceScore
  })
    blueScore?: PartialAllianceScore

  @ValidateNested()
  @Type(() => PartialMatchScoreMetadata)
  @ApiProperty({ description: 'Data about the match that is independent of the current game', type: PartialMatchScoreMetadata })
    metadata?: PartialMatchScoreMetadata
}

export class RecursivePartialMatchScore extends IntersectionType(
  PartialAllianceMatchScore,
  PartialType(OmitType(MatchScore, ['redScore', 'blueScore', 'metadata'] as const))
) {}

// export type MatchScoreUpdate = RecursivePartial<Omit<MatchScore, 'locked'>>
export class MatchScoreUpdate extends OmitType(RecursivePartialMatchScore, [
  'locked'
] as const) {}

class AdditionalInfoForMatchScoreInMemory {
  @ApiProperty()
  @IsString()
    id: string

  @ApiProperty()
  @IsString()
    round: string
}
export class MatchScoreInMemory extends IntersectionType(
  MatchScore,
  AdditionalInfoForMatchScoreInMemory
) {}

// export type MatchScoreInMemory = { id: string } & RecursivePartial<
// Omit<MatchScore, 'locked'>
// > &
// Pick<MatchScore, 'locked'>
class HasMatchId {
  @ApiProperty()
  @IsPositive()
  @IsInt()
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

  @IsJSON()
  @ApiProperty({
    description: 'Blue team raw score'
  })
    metadata: string
}
export class MatchScoreInPrismaCreationData extends IntersectionType(
  SerializedAllianceScoreMatchScore,
  OmitType(MatchScore, ['locked', 'redScore', 'blueScore', 'metadata'] as const),
  HasMatchId
) {}
class HasScoreId {
  @ApiProperty()
  @IsPositive()
  @IsInt()
    scoreId: number
}
class HasTimeSaved {
  @ApiProperty()
  @IsDate() // might be correct decorator (im not sure)
    timeSaved: Date
}
export class MatchScoreInPrisma extends IntersectionType(
  MatchScoreInPrismaCreationData,
  HasScoreId,
  HasTimeSaved
) {}

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
MatchScoreInMemory,
RecursiveRequired<MatchScoreInMemory>
>

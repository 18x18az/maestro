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
  IsPositive,
  Max,
  Min,
  ValidateNested
} from 'class-validator'
import { QualMatch } from 'src/features/initial/qual-schedule/qual-schedule.interface'
import { RecursivePartial } from 'src/utils/recursivePartial'

// declare function ObjectToStringType<T>(
//   classRef: Type<T>
// ): Type<{ [K in keyof T]: T[K] extends object ? string : T[K] }>;
export enum MATCH_ROUND {
  QUALIFICATION = 'qual',
  ELIMINATION = 'elim'
}

export interface MatchIdentifiers {
  matchId: number
  round: MATCH_ROUND
}

export enum ELEVATION {
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
export enum QUAL_TEAM_METADATA {
  NONE = 'none',
  NO_SHOW = 'no_show',
  DISQUALIFIED = 'disqualified',
}
/** This should be completely independent of the current game */
class QualMatchScoreAllianceMetadata {
  @IsEnum(QUAL_TEAM_METADATA)
  @ApiProperty({
    description: 'Whether the first team no-show-ed or dq-ed in the match',
    example: 'none',
    enum: QUAL_TEAM_METADATA,
    default: 'none'
  })
    team1: QUAL_TEAM_METADATA

  @IsEnum(QUAL_TEAM_METADATA)
  @ApiProperty({
    description: 'Whether the first team no-show-ed or dq-ed in the match',
    example: 'none',
    enum: QUAL_TEAM_METADATA,
    default: 'none'
  })
    team2: QUAL_TEAM_METADATA

  @IsBoolean()
  @ApiProperty({
    description: 'Whether the alliance was awarded the Autonomous Win Point',
    example: false,
    default: false
  })
    autonWinPoint: boolean
}
export class ElimMatchScoreAllianceMetadata {
  @IsBoolean()
  @ApiProperty({ description: "Alliance's dq state", example: true, default: false })
    disqualified: boolean
}

export class QualMatchScoreMetadata {
  @ValidateNested()
  @Type(() => QualMatchScoreAllianceMetadata)
  @ApiProperty({ description: "Red's metadata", type: QualMatchScoreAllianceMetadata })
    red: QualMatchScoreAllianceMetadata

  @ValidateNested()
  @Type(() => QualMatchScoreAllianceMetadata)
  @ApiProperty({ description: "Blue's metadata", type: QualMatchScoreAllianceMetadata })
    blue: QualMatchScoreAllianceMetadata
}

export class ElimMatchScoreMetadata {
  @ValidateNested()
  @Type(() => ElimMatchScoreAllianceMetadata)
  @ApiProperty({ description: "Red's metadata", type: ElimMatchScoreAllianceMetadata })
    red: ElimMatchScoreAllianceMetadata

  @ValidateNested()
  @Type(() => ElimMatchScoreAllianceMetadata)
  @ApiProperty({ description: "Blue's metadata", type: ElimMatchScoreAllianceMetadata })
    blue: ElimMatchScoreAllianceMetadata
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
  // doesn't work
  // @ValidateIf(({ zoneTriballs, goalTriballs }: AllianceScore) => {
  //   console.log(goalTriballs + zoneTriballs)
  //   return ((goalTriballs + zoneTriballs) <= 56)
  // })
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
  // doesn't work
  // @ValidateIf(({ allianceTriballsInGoal, allianceTriballsInZone }: AllianceScore) => (allianceTriballsInGoal + allianceTriballsInZone) <= 2)
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

export class BaseMatchScore {
  @ValidateNested()
  @Type(() => AllianceScore)
  @ApiProperty({ description: 'Red team raw score', type: AllianceScore })
    redScore: AllianceScore

  @ValidateNested()
  @Type(() => AllianceScore)
  @ApiProperty({ description: 'Blue team raw score', type: AllianceScore })
    blueScore: AllianceScore

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

class HasQualMatchScoreMetadata {
  @ValidateNested()
  @Type(() => QualMatchScoreMetadata)
  @ApiProperty({ description: 'Data about the match that is independent of the current game', type: QualMatchScoreMetadata })
    metadata: QualMatchScoreMetadata
}
class HasElimMatchScoreMetadata {
  @ValidateNested()
  @Type(() => ElimMatchScoreMetadata)
  @ApiProperty({ description: 'Data about the match that is independent of the current game', type: ElimMatchScoreMetadata })
    metadata: ElimMatchScoreMetadata
}
export class QualMatchScore extends IntersectionType(HasQualMatchScoreMetadata, BaseMatchScore) {}
export class ElimMatchScore extends IntersectionType(HasElimMatchScoreMetadata, BaseMatchScore) {}

export type MatchScore = ElimMatchScore | QualMatchScore

// class DefaultAllianceScore extends AllianceScore {
//   goalTriballs: number = 0
//   zoneTriballs: number = 0
//   allianceTriballsInGoal: number = 0
//   allianceTriballsInZone: number = 0
//   robot1Tier: ELEVATION = ELEVATION.NONE
//   robot2Tier: ELEVATION = ELEVATION.NONE
// }
// class DefaultAllianceMetadata extends QualMatchScoreAllianceMetadata {
//   team1: QUAL_TEAM_METADATA = QUAL_TEAM_METADATA.NONE
//   team2: QUAL_TEAM_METADATA = QUAL_TEAM_METADATA.NONE
//   autonWinPoint: boolean = false
// }
// class DefaultMatchScoreMetadata extends QualMatchScoreMetadata {
//   red: QualMatchScoreAllianceMetadata = new DefaultAllianceMetadata()
//   blue: QualMatchScoreAllianceMetadata = new DefaultAllianceMetadata()
// }

// export class DefaultMatchScore extends MatchScore {
//   redScore: AllianceScore = new DefaultAllianceScore()
//   blueScore: AllianceScore = new DefaultAllianceScore()
//   metadata: QualMatchScoreMetadata = new DefaultMatchScoreMetadata()
//   autonWinner: AUTON_WINNER = AUTON_WINNER.NONE
//   locked: boolean = false
// }

class PartialAllianceScore extends PartialType(AllianceScore) {}
class PartialQualMatchScoreAllianceMetadata extends PartialType(QualMatchScoreAllianceMetadata) {}
class PartialElimMatchScoreAllianceMetadata extends PartialType(ElimMatchScoreAllianceMetadata) {}

class PartialQualMatchScoreMetadata {
  @ValidateNested()
  @Type(() => PartialQualMatchScoreAllianceMetadata)
  @ApiProperty({ description: "Red's metadata", type: PartialQualMatchScoreAllianceMetadata })
    red?: PartialQualMatchScoreAllianceMetadata

  @ValidateNested()
  @Type(() => PartialQualMatchScoreAllianceMetadata)
  @ApiProperty({ description: "Blue's metadata", type: PartialQualMatchScoreAllianceMetadata })
    blue?: PartialQualMatchScoreAllianceMetadata
}
class PartialElimMatchScoreMetadata {
  @ValidateNested()
  @Type(() => PartialElimMatchScoreAllianceMetadata)
  @ApiProperty({ description: "Red's metadata", type: PartialElimMatchScoreAllianceMetadata })
    red?: PartialElimMatchScoreAllianceMetadata

  @ValidateNested()
  @Type(() => PartialElimMatchScoreAllianceMetadata)
  @ApiProperty({ description: "Blue's metadata", type: PartialElimMatchScoreAllianceMetadata })
    blue?: PartialElimMatchScoreAllianceMetadata
}

class PartialBaseMatchScore {
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
}
class PartialQualMatchScore extends PartialBaseMatchScore {
  @ValidateNested()
  @Type(() => PartialQualMatchScoreMetadata)
  @ApiProperty({ description: 'Data about the match that is independent of the current game', type: PartialQualMatchScoreMetadata })
    metadata?: PartialQualMatchScoreMetadata
}
class PartialElimMatchScore extends PartialBaseMatchScore {
  @ValidateNested()
  @Type(() => PartialElimMatchScoreMetadata)
  @ApiProperty({ description: 'Data about the match that is independent of the current game', type: PartialElimMatchScoreMetadata })
    metadata?: PartialElimMatchScoreMetadata
}

class RecursivePartialQualMatchScore extends IntersectionType(
  PartialQualMatchScore,
  PartialType(OmitType(QualMatchScore, ['redScore', 'blueScore', 'metadata'] as const))
) {}
class RecursivePartialElimMatchScore extends IntersectionType(
  PartialElimMatchScore,
  PartialType(OmitType(ElimMatchScore, ['redScore', 'blueScore', 'metadata'] as const))
) {}
export type RecursivePartialMatchScore = RecursivePartialQualMatchScore | RecursivePartialElimMatchScore

export class QualMatchScoreUpdate extends OmitType(RecursivePartialQualMatchScore, [
  'locked'
] as const) {}
export class ElimMatchScoreUpdate extends OmitType(RecursivePartialElimMatchScore, [
  'locked'
] as const) {}
export type MatchScoreUpdate = QualMatchScoreUpdate | ElimMatchScoreUpdate

export class MatchDetails extends OmitType(QualMatch, ['id'] as const) {}

export class ElimMatchScoreWithDetails extends IntersectionType(ElimMatchScore, MatchDetails) {}
export class QualMatchScoreWithDetails extends IntersectionType(QualMatchScore, MatchDetails) {}

export type MatchScoreWithDetails = ElimMatchScoreWithDetails | QualMatchScoreWithDetails

export type MatchScoreInMemory = { id: string } & MatchDetails &((QualMatchScore & { round: MATCH_ROUND.QUALIFICATION }) |(ElimMatchScore & { round: MATCH_ROUND.ELIMINATION }))

class AdditionalMatchScoreFromPrismaProperties {
  @IsPositive()
  @IsInt()
  @ApiProperty({ description: 'the id of the match' })
    matchId: number

  @IsPositive()
  @IsInt()
  @ApiProperty({ description: 'The id of the MatchScore' })
    scoreId: number

  @IsDate() // might be correct decorator (im not sure)
  @ApiProperty({ description: 'The time this MatchScore was saved to the database' })
    timeSaved: Date
}
export class BaseMatchScoreFromPrisma extends IntersectionType(AdditionalMatchScoreFromPrismaProperties, OmitType(BaseMatchScore, ['locked'] as const)) {}

export class QualMatchScoreFromPrisma extends IntersectionType(BaseMatchScoreFromPrisma, HasQualMatchScoreMetadata) {}
export class ElimMatchScoreFromPrisma extends IntersectionType(BaseMatchScoreFromPrisma, HasElimMatchScoreMetadata) {}

export type MatchScoreFromPrisma = QualMatchScoreFromPrisma | ElimMatchScoreFromPrisma

export class QualMatchScoreFromPrismaWithDetails extends IntersectionType(QualMatchScoreFromPrisma, MatchDetails) {}
export class ElimMatchScoreFromPrismaWithDetails extends IntersectionType(ElimMatchScoreFromPrisma, MatchDetails) {}

export type MatchScoreFromPrismaWithDetails = QualMatchScoreFromPrismaWithDetails | ElimMatchScoreFromPrismaWithDetails

export type MatchScoreInPrisma = { [K in keyof MatchScoreFromPrisma]: MatchScoreFromPrisma[K] extends Date ? MatchScoreFromPrisma[K] : MatchScoreFromPrisma[K] extends object | string ? string : MatchScoreFromPrisma[K] }
// ---------------------------
//        Type Checks
// ---------------------------

// checks stuff ig: https://stackoverflow.com/a/57594451
type MutuallyAssignable<T extends U, U extends V, V = T> = true

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _CheckRecursivePartialMatchScore = MutuallyAssignable<
MatchScoreUpdate,
RecursivePartial<MatchScore>
>

// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// type _CheckFullMatchScoreInMemory = MutuallyAssignable<
// MatchScoreInMemory,
// RecursiveRequired<MatchScoreInMemory>
// >

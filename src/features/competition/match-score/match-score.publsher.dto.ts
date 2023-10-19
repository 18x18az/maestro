import { ApiProperty } from '@nestjs/swagger'
import { CommonMatchScore, ElimMatchScoreAllianceMetadata, QualMatchScoreAllianceMetadata } from '.'

enum ROUND {
  RO16 = 'ro16',
  QF = 'qf',
  SF = 'sf',
  F = 'f'
}

export class PublishedQualMatchScore extends CommonMatchScore {
  @ApiProperty({ description: 'Red alliance metadata' })
    red: QualMatchScoreAllianceMetadata

  @ApiProperty({ description: 'Blue alliance metadata' })
    blue: QualMatchScoreAllianceMetadata
}

export class PublishedElimMatchScore extends CommonMatchScore {
  @ApiProperty({ description: 'Red alliance metadata' })
    red: ElimMatchScoreAllianceMetadata

  @ApiProperty({ description: 'Blue alliance metadata' })
    blue: ElimMatchScoreAllianceMetadata

  @ApiProperty({ description: 'Round of the match', enum: ROUND, example: ROUND.RO16 })
    round: ROUND

  @ApiProperty({ description: 'Sub-number of the match', example: 2 })
    subNumber: number
}

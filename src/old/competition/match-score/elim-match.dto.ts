import { ApiProperty } from '@nestjs/swagger'
import { MatchMetadataUpload } from './common-match.dto'

export class ElimMatchScoreTeamMeta {
  @ApiProperty({
    description: 'Team number',
    example: '127C'
  })
    team: string
}

export class ElimMatchScoreAllianceMetadata extends MatchMetadataUpload {
  @ApiProperty({
    description: 'Team 1 metadata'
  })
    team1: ElimMatchScoreTeamMeta

  @ApiProperty({
    description: 'Team 2 metadata',
    required: false
  })
    team2?: ElimMatchScoreTeamMeta
}

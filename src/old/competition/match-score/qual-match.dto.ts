// import { ApiProperty } from '@nestjs/swagger'
// import { IsBoolean, IsString } from 'class-validator'
// import { MatchMetadataUpload } from '.'

// export class QualMatchScoreTeamMetadata extends MatchMetadataUpload {
//   @IsString()
//   @ApiProperty({
//     description: 'Team number',
//     example: '127C',
//     default: '127C'
//   })
//     team: string
// }

// export class QualMatchScoreAllianceMetadata {
//   @ApiProperty({})
//     team1: QualMatchScoreTeamMetadata

//   @ApiProperty({})
//     team2?: QualMatchScoreTeamMetadata

//   @IsBoolean()
//   @ApiProperty({
//     description: 'Whether the alliance was awarded the Autonomous Win Point',
//     example: false,
//     default: false
//   })
//     autonWinPoint: boolean
// }

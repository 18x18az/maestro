import { IsBoolean, IsNumber, IsString } from 'class-validator'

export class Field {
  @IsNumber()
    id: number

  @IsString()
    name: string

  @IsBoolean()
    isCompetition: boolean

  @IsBoolean()
    isSkills: boolean
}

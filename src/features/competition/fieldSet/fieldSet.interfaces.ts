import { ApiProperty } from "@nestjs/swagger";

export class FieldState {
  @ApiProperty({ description: 'The ID of the active field in the fieldset', example: '1'})
  currentField: string | null
}

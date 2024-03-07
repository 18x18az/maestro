import { registerEnumType } from '@nestjs/graphql'

export enum SolidDisplayDisplayed {
  INSPECTION = 'INSPECTION',
  LOGO = 'LOGO',
  RESULTS = 'RESULTS'
}

registerEnumType(SolidDisplayDisplayed, {
  name: 'SolidDisplayDisplayed',
  description: 'The currently displayed view on the solid display'
})

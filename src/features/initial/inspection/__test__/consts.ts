import { InspectionSummary } from '@18x18az/rosetta'
import { InspectionChecklist } from '../inspection.dto'

export const mockInspectionChecklist: InspectionChecklist = {
  group1: [
    { text: 'criteria1', uuid: 1 },
    { text: 'criteria2', uuid: 2 }
  ]
}

export function makeExpectedSummary (checklist: InspectionChecklist, points: number[]): InspectionSummary {
  return Object.keys(checklist).map(group => {
    return {
      text: group,
      criteria: checklist[group].map(criteria => {
        return {
          text: criteria.text,
          met: points.includes(criteria.uuid),
          uuid: criteria.uuid
        }
      })
    }
  })
}

export const partialMet = [1]
export const noneMet = []

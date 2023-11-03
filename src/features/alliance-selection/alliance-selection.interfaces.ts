export interface AllianceSelectionStatus {
  picking: string | null
  picked: string | null
  pickable: string[]
  alliances: Array<[string, string]>
  remaining: string[]
}

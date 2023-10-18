type Team = string
type Teams = Team[]

enum ActionType {
  Pick = 'PICK',
  Accept = 'ACCEPT',
  Decline = 'DECLINE',
  NoShow = 'NOSHOW'
}

interface RankingsOperation {
  action: ActionType
  target?: string
}

interface Alliance {
  captain: Team
  picked?: Team
}

interface RankingState {
  eligible: Teams
  rankings: Teams
  alliances: Alliance[]
  picking: Team
  picked?: Team
  ineligible: Teams
  allowed_actions: ActionType[]
}

class AllianceSelection {
  private readonly rankings: Teams
  private state: RankingState
  private operations: RankingsOperation[]
  private readonly maxAlliances: number
  constructor (rankings: Teams, alliances: number) {
    this.rankings = rankings
    this.maxAlliances = alliances
    this.operations = new Array<RankingsOperation>()
    this.resetState()
  }

  resetState (): void {
    this.state = {
      eligible: this.rankings.slice(1),
      rankings: this.rankings.slice(1),
      alliances: [],
      picking: this.rankings[0],
      ineligible: [],
      picked: undefined,
      allowed_actions: [ActionType.Pick, ActionType.NoShow]
    }
  }

  clearPicked (): void {
    this.state.picked = undefined
    this.state.allowed_actions = [ActionType.Pick, ActionType.NoShow]
  }

  getIsDone (): boolean {
    return (this.state.alliances.length >= this.maxAlliances)
  }

  doAccept (): void {
    this.state.alliances.push({ captain: this.state.picking, picked: this.state.picked })
    this.state.eligible = this.state.eligible.filter(meow => meow !== this.state.picked)
    this.state.rankings = this.state.rankings.filter(meow => meow !== this.state.picked)
    this.state.eligible = this.state.eligible.filter(meow => meow !== this.state.picking)
    this.state.rankings = this.state.rankings.filter(meow => meow !== this.state.picking)
    this.clearPicked()
    this.state.picking = this.state.rankings[0]
  }

  doDecline (): void {
    this.state.eligible = this.state.eligible.filter(meow => meow !== this.state.picked)
    if (this.state.picked !== undefined) {
      this.state.ineligible.push(this.state.picked)
    }
    this.clearPicked()
  }

  doPick (target: Team): void {
    if (!this.state.eligible.includes(target)) {
      throw Error('team not eligible')
    }
    this.state.picked = target
    this.state.allowed_actions = [ActionType.Accept, ActionType.Decline]
  }

  doNoShow (): void {
    this.state.eligible = this.state.eligible.filter(meow => meow !== this.state.picking)
    this.state.rankings = this.state.rankings.filter(meow => meow !== this.state.picking)
    this.state.ineligible.push(this.state.picking)
    this.state.picking = this.state.rankings[0]
    this.clearPicked()
  }

  applyOperation (operation: RankingsOperation): void {
    /**
         * changes the state of the internal alliance selection variable based on an instruction given
         */
    if (!this.state.allowed_actions.includes(operation.action)) {
      throw Error('action not allowed') // would a specific type of error be better?
    }
    switch (operation.action) {
      case ActionType.Pick: {
        if (operation.target === undefined) {
          throw Error('target not defined')
        }
        this.doPick(operation.target)
        break
      }
      case ActionType.Accept: {
        this.doAccept()
        break
      }
      case ActionType.Decline: {
        this.doDecline()
        break
      }
      case ActionType.NoShow: {
        this.doNoShow()
        break
      }
      default: {
        throw Error('Unknown action')
      }
    }
  }

  addOperation (operation: RankingsOperation): void {
    /**
         * adds an operation to the history, and also applies it
         */
    if (this.getIsDone()) {
      throw Error('alliance selection is over, silly')
    }
    this.operations.push(operation)
    this.applyOperation(operation)
  }

  undo (): Object {
    /**
         * removes the previous operation from the history, and rebuilds the state
         */
    this.operations.pop()
    this.resetState()
    this.operations.forEach(mrrp => { this.applyOperation(mrrp) })
    return { success: true }
  }

  buildState (): Object {
    /**
         * rebuilds the state without making changes. ideally this should never change anything and shouldn't be used
         */
    this.resetState()
    this.operations.forEach(mrrp => { this.applyOperation(mrrp) })
    return { success: true }
  }

  clearAllianceSelection (): Object {
    /**
         * resets all of alliance selection. make sure to add an endpoint for this so when i hack your network it will be funny!
         */
    this.operations = new Array<RankingsOperation>()
    this.resetState()
    return { success: true }
  }

  pick (team: string): Object {
    /**
         * instruct the currently picking team to pick the team specifed in the argument
         */
    if (!this.state.allowed_actions.includes(ActionType.Pick)) {
      return { success: false, error: 'picking not allowed at this time' }
    }
    if (!this.state.eligible.includes(team)) {
      return { success: false, error: "picked team isn't eligible" }
    }
    this.addOperation({
      action: ActionType.Pick,
      target: team
    })
    return { success: true }
  }

  accept (): Object {
    /**
         * have team accept offer
         */
    if (!this.state.allowed_actions.includes(ActionType.Accept)) {
      return { success: false, error: 'accepting not allowed at this time' }
    }
    this.addOperation({
      action: ActionType.Accept
    })
    return { success: true }
  }

  decline (): Object {
    /**
         * have team decline offer
         */
    if (!this.state.allowed_actions.includes(ActionType.Decline)) {
      return { success: false, error: 'declining not allowed at this time' }
    }
    this.addOperation({
      action: ActionType.Decline
    })
    return { success: true }
  }

  noShow (): Object {
    /**
         * call this function if a picking team doesnt show up
         */
    if (!this.state.allowed_actions.includes(ActionType.NoShow)) {
      return { success: false, error: 'no-showing not allowed at this time' }
    }
    this.addOperation({
      action: ActionType.NoShow
    })
    return { success: true }
  }

  getCurrentState (): RankingState {
    /**
         *  returns the entire current state
         */
    return this.state
  }
}

class AllianceSelectionService {
  private allianceSelection: AllianceSelection
  private allianceSelectionRunning: Boolean
  private savedState: RankingState
  constructor () {
    this.allianceSelectionRunning = false
  }

  startAllianceSelection (rankings: Teams, alliances: number): void {
    this.allianceSelection = new AllianceSelection(rankings, alliances)
    this.allianceSelectionRunning = true
  }

  stopAllianceSelection (): void {
    this.throwErrorIfNotRunning()
    this.savedState = this.allianceSelection.getCurrentState()
    this.allianceSelectionRunning = false
  }

  throwErrorIfNotRunning (): void {
    if (this.allianceSelection === undefined || this.allianceSelectionRunning === false) {
      throw Error('alliance selection not running')
    }
  }

  pick (target: Team): Object {
    this.throwErrorIfNotRunning()
    return this.allianceSelection.pick(target)
  }

  decline (): Object {
    this.throwErrorIfNotRunning()
    return this.allianceSelection.decline()
  }

  accept (): Object {
    this.throwErrorIfNotRunning()
    return this.allianceSelection.accept()
  }

  noShow (): Object {
    this.throwErrorIfNotRunning()
    return this.allianceSelection.noShow()
  }

  undo (): Object {
    this.throwErrorIfNotRunning()
    return this.allianceSelection.undo()
  }

  buildState (): Object {
    this.throwErrorIfNotRunning()
    return this.allianceSelection.buildState()
  }

  getCurrentState (): RankingState {
    if (this.allianceSelectionRunning === true) {
      return this.allianceSelection.getCurrentState()
    } else {
      return this.savedState
    }
  }

  getIsDone (): boolean {
    return this.allianceSelection.getIsDone()
  }
}

const a = new AllianceSelectionService() // so ts-standard wont yell at me
console.log(a)

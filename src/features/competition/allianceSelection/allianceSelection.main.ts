
enum ActionType {
    Pick = 1,
    Accept = 2,
    Decline = 3,
    NoShow = 4
}

interface RankingsOperation {
    action: ActionType,
    target?: string
}

interface RankingState {
    eligible: Array<string>,
    rankings: Array<string>,
    alliances: Array<Array<string>>,
    picking: string,
    picked: string,
    ineligible: Array<string>,
    allowed_actions: Array<ActionType>
}

class AllianceSelection{
    _rankings: Array<string>
    _state: RankingState
    _operations: Array<RankingsOperation>
    constructor(rankings: Array<string>){
        this._state = <RankingState>{}
        this._rankings = rankings
        this._operations = new Array<RankingsOperation>()
        this.resetState()
    }
    resetState(): void{
        this._state.eligible = this._rankings.slice(1)
        this._state.rankings = this._rankings.slice(1)
        this._state.alliances = new Array<Array<string>>()
        this._state.picking = this._rankings[0]
        this._state.ineligible = new Array<string>()
        this._state.picked = ""
        this._state.allowed_actions = [ActionType.Pick, ActionType.NoShow]
    }
    applyOperation(operation: RankingsOperation): void{
        if(!this._state.allowed_actions.includes(operation.action)){
            throw Error("action not allowed")
        }
        if(operation.action == ActionType.Pick){
            if(!this._state.eligible.includes(operation.target as string)){
                throw Error("team not eligible")
            }
            this._state.picked = operation.target as string
            this._state.allowed_actions = [ActionType.Accept, ActionType.Decline]
        }
        else if(operation.action == ActionType.Accept){
            this._state.alliances.push([this._state.picking, this._state.picked])
            this._state.eligible = this._state.eligible.filter(meow => meow != this._state.picked)
            this._state.rankings = this._state.rankings.filter(meow => meow != this._state.picked)
            this._state.eligible = this._state.eligible.filter(meow => meow != this._state.picking)
            this._state.rankings = this._state.rankings.filter(meow => meow != this._state.picking)
            this._state.picked = ""
            this._state.picking = this._state.rankings[0]
            this._state.allowed_actions = [ActionType.Pick, ActionType.NoShow]
        }
        else if(operation.action == ActionType.Decline){
            this._state.eligible = this._state.eligible.filter(meow => meow != this._state.picked)
            this._state.ineligible.push(this._state.picked)
            this._state.picked = ""
            this._state.allowed_actions = [ActionType.Pick, ActionType.NoShow]
        }
        else if(operation.action == ActionType.NoShow){
            this._state.eligible = this._state.eligible.filter(meow => meow != this._state.picking)
            this._state.rankings = this._state.rankings.filter(meow => meow != this._state.picking)
            this._state.ineligible.push(this._state.picking)
            this._state.picking = this._state.rankings[0]
            this._state.allowed_actions = [ActionType.Pick, ActionType.NoShow]
        }
        else {
            throw Error("Unknown action")
        }
    }
    addOperation(operation : RankingsOperation): void{
        this._operations.push(operation)
        this.applyOperation(operation)
    }
    undo(){
        this._operations.pop()
        this.resetState()
        for (const mrrp of this._operations) {
            this.applyOperation(mrrp)
        }
    }
    buildState(){
        this.resetState()
        for (const mrrp of this._operations) {
            this.applyOperation(mrrp)
        }
    }
    clearAllianceSelection(){
        this._operations = new Array<RankingsOperation>()
        this.resetState()
    }
    pick(team: string){
        if(!this._state.allowed_actions.includes(ActionType.Pick)){
            return {success: false, error: "picking not allowed at this time"}
        }
        if(!this._state.eligible.includes(team)){
            return {success: false, error: "picked team isn't eligible"}
        }
        this.addOperation({
            action: ActionType.Pick,
            target: team
        })
        return {success: true}
    }
    accept(){
        if(!this._state.allowed_actions.includes(ActionType.Accept)){
            return {success: false, error: "accepting not allowed at this time"}
        }
        this.addOperation({
            action: ActionType.Accept
        })
        return {success: true}
    }
    decline(){
        if(!this._state.allowed_actions.includes(ActionType.Decline)){
            return {success: false, error: "declining not allowed at this time"}
        }
        this.addOperation({
            action: ActionType.Decline
        })
        return {success: true}
    }
    noShow(){
        if(!this._state.allowed_actions.includes(ActionType.NoShow)){
            return {success: false, error: "no-showing not allowed at this time"}
        }
        this.addOperation({
            action: ActionType.NoShow
        })
        return {success: true}
    }
    getCurrentState() : Object{
        return this._state
    }
}

let a = new AllianceSelection(["5090X", "6030J", "99067B", "127A", "2114V", "PYRO", "RIT3"])
a.noShow()
a.pick("127A")
a.decline()
a.pick("99067B")
console.log(a.getCurrentState())
a.accept()
console.log(a.getCurrentState())
a.undo()
console.log(a.getCurrentState())
a.buildState()
console.log(a.getCurrentState())
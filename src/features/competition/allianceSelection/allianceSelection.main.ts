
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
        /**
         * changes the state of the internal alliance selection variable based on an instruction given
         */
        if(!this._state.allowed_actions.includes(operation.action)){
            throw Error("action not allowed") // would a specific type of error be better?
        }
        if(operation.action == ActionType.Pick){
            if(!this._state.eligible.includes(operation.target as string)){
                throw Error("team not eligible")
            }
            this._state.picked = operation.target as string // typescript is fucking annoying sometimes
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
        /**
         * adds an operation to the history, and also applies it 
         */
        this._operations.push(operation)
        this.applyOperation(operation)
    }
    undo(){
        /**
         * removes the previous operation from the history, and rebuilds the state
         */
        this._operations.pop()
        this.resetState()
        for (const mrrp of this._operations) {
            this.applyOperation(mrrp)
        }
        return {success: true}
    }
    buildState(){
        /**
         * rebuilds the state without making changes. ideally this should never change anything and shouldn't be used
         */
        this.resetState()
        for (const mrrp of this._operations) {
            this.applyOperation(mrrp)
        }
        return {success: true}
    }
    clearAllianceSelection(){
        /**
         * resets all of alliance selection. make sure to add an endpoint for this so when i hack your network it will be funny!
         */
        this._operations = new Array<RankingsOperation>()
        this.resetState()
        return {success: true}
    }
    pick(team: string){
        /**
         * instruct the currently picking team to pick the team specifed in the argument
         */
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
        /**
         * have team accept offer
         */
        if(!this._state.allowed_actions.includes(ActionType.Accept)){
            return {success: false, error: "accepting not allowed at this time"}
        }
        this.addOperation({
            action: ActionType.Accept
        })
        return {success: true}
    }
    decline(){
        /**
         * have team decline offer
         */
        if(!this._state.allowed_actions.includes(ActionType.Decline)){
            return {success: false, error: "declining not allowed at this time"}
        }
        this.addOperation({
            action: ActionType.Decline
        })
        return {success: true}
    }
    noShow(){
        /**
         * call this function if a picking team doesnt show up
         */
        if(!this._state.allowed_actions.includes(ActionType.NoShow)){
            return {success: false, error: "no-showing not allowed at this time"}
        }
        this.addOperation({
            action: ActionType.NoShow
        })
        return {success: true}
    }
    getCurrentState() : Object{
        /**
         *  returns the entire current state
         */
        return this._state
    }
}

/* Example
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
*/
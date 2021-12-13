import { Team, TeamId } from "@18x18az/rosetta";
import { getNextId, record, IMetadata, LogType } from "../utils/log";


var MAX_NUM_ALLIANCES = 16;

// TODO: define this in rosetta
interface IAlliance {
    team1: TeamId
    team2: TeamId
}

interface IAllianceStatus{
    picking: TeamId | null
    selected: TeamId | null
    eligible: Array<TeamId> // can be picked by an alliance captain
    remaining: Array<TeamId> // can not be picked, but can still be alliance captain
    alliances: Array<IAlliance>
}

class AllianceSelection {

    // current state
    state: IAllianceStatus = {
        picking: null,
        selected: null,
        eligible: [],
        remaining: [],
        alliances: []
    };

    // a stack of previous states
    history: Array<IAllianceStatus> = [];

    /*
    precondition for constructor:
    - teams must already be sorted, from first seed -> lowest seed
    */
    constructor(teams: Array<TeamId>){

        this.state.eligible = teams;
        this.state.remaining = teams;
        this.getNextPicker();
    }

    pick(team: TeamId){
        // generate metadata
        var id = getNextId();
        var meta: IMetadata = {
            id
        }

        if(!this.state.eligible.includes(team)){
            record(meta, LogType.ERROR, team + " is not in eligible")
            return;
        }

        // TODO: do we wanna push history before checking for error? we probably should
        this.onUpdate();

        // remove from eligible and set selected
        for(var i = 0; i < this.state.eligible.length; i++){
            if(team == this.state.eligible[i]){
                this.state.eligible.splice(i, 1);
                break;
            }
        }
        this.state.selected = team;


        record(meta, LogType.LOG, this.state.picking + " has selected " + this.state.selected)
    } // end pick

    accept(){
        // generate metadata
        var id = getNextId();
        var meta: IMetadata = {
            id
        }

        if(this.state.selected == ""){
            record(meta, LogType.ERROR, "selected is empty");
        }

        // TODO: same as in pick()
        this.onUpdate();

        for(var i = 0; i < this.state.remaining.length; i++){
            if(this.state.selected == this.state.remaining[i]){
                this.state.remaining.splice(i, 1);
                break;
            }
        }

        // make an alliance object and add it to this.state.alliances
        var alliance: IAlliance = {
            team1: this.state.picking as string,
            team2: this.state.selected as string
        };
        this.state.alliances.push(alliance);

        record(meta, LogType.LOG, this.state.selected + " has accepted " + this.state.picking);

        // before getting the next picker, make sure we have teams remaining or 
        // we have already reached the max number of alliances

        if(this.state.alliances.length == MAX_NUM_ALLIANCES || this.state.remaining.length == 0){
            this.selectionComplete();
            return;
        }

        this.getNextPicker();

    } // end accept

    decline(){
        // generate metadata
        var id = getNextId();
        var meta: IMetadata = {
            id
        }
        
        if(this.state.selected == ""){
            record(meta, LogType.ERROR, "selected is empty");
        }

        this.onUpdate();
        

        // remove selected from eligible
        for(var i = 0; i < this.state.eligible.length; i++){
            if(this.state.selected == this.state.eligible[i]){
                this.state.eligible.splice(i, 1);
                break;
            }
        }
        this.state.selected = "";
        record(meta, LogType.LOG, this.state.selected + " has declined " + this.state.picking);

        // if eligible.length becomes 0 as a result, then we are done and call selectionComplete
        if(this.state.eligible.length == 0){
            this.selectionComplete();
        }
    }

    getNextPicker(){
        // generate metadata
        var id = getNextId();
        var meta: IMetadata = {
            id
        }

        this.onUpdate();

        this.state.picking = this.state.remaining.shift() as string;

        for(var i = 0; i < this.state.eligible.length; i++){
            if(this.state.selected == this.state.eligible[i]){
                this.state.eligible.splice(i, 1);
                break;
            }
        }
        record(meta, LogType.LOG, this.state.picking + " is now picking");
    }

    undo(){
        // generate metadata
        var id = getNextId();
        var meta: IMetadata = {
            id
        }
        
        if(this.history.length == 0){
            record(meta, LogType.ERROR, "bruh, history is empty");
        }

        this.state = this.history.pop() as IAllianceStatus;

        // TODO: it could be useful to include what the action was
        // would need some string inside of IAllianceStatus that describes the action completed
        record(meta, LogType.LOG, "undoing action")
    }

    selectionComplete(){
        // generate metadata
        var id = getNextId();
        var meta: IMetadata = {
            id
        }
        record(meta, LogType.LOG, `selection is now complete, alliances are ${this.state.alliances}`);
    }

    onUpdate(){
        this.history.push(this.state);
        // TODO: send data to clients
    }
}


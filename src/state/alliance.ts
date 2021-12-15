import { Team, TeamId } from "@18x18az/rosetta";
import { getNextId, record, IMetadata, LogType } from "../utils/log";


const MAX_NUM_ALLIANCES = 16;

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

export class AllianceSelection {

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
    constructor(teams: Array<TeamId>, meta: IMetadata){

        // copy teams into eligible and remaining
        this.state.eligible = [...teams];
        this.state.remaining = [...teams];
        this.state.selected = ""
        this.getNextPicker(meta);
    }

    pick(team: TeamId, meta: IMetadata){

        if(!this.state.eligible.includes(team)){
            record(meta, LogType.ERROR, team + " is not in eligible")
            return;
        }

        

        // remove from eligible and set selected
        for(let i = 0; i < this.state.eligible.length; i++){
            if(team == this.state.eligible[i]){
                this.state.eligible.splice(i, 1);
                break;
            }
        }
        this.state.selected = team;

        this.onUpdate();
        record(meta, LogType.LOG, this.state.picking + " has selected " + this.state.selected)
    } // end pick

    accept(meta: IMetadata){

        if(this.state.selected == ""){
            record(meta, LogType.ERROR, "selected is empty");
            return;
        }

        for(let i = 0; i < this.state.remaining.length; i++){
            if(this.state.selected == this.state.remaining[i]){
                this.state.remaining.splice(i, 1);
                break;
            }
        }

        // make an alliance object and add it to this.state.alliances
        let alliance: IAlliance = {
            team1: this.state.picking as string,
            team2: this.state.selected as string
        };
        this.state.alliances.push(alliance);
        
        
        record(meta, LogType.LOG, this.state.selected + " has accepted " + this.state.picking);
        this.state.selected = "";
        this.onUpdate();
        // before getting the next picker, make sure we have teams remaining or 
        // we have already reached the max number of alliances
        
        if(this.state.alliances.length == MAX_NUM_ALLIANCES || this.state.remaining.length == 0){
            this.selectionComplete(meta);
            return;
        }

        this.getNextPicker(meta);

    } // end accept

    decline(meta: IMetadata){
        
        if(this.state.selected == ""){
            record(meta, LogType.ERROR, "selected is empty");
            return;
        }

        // remove selected from eligible
        for(let i = 0; i < this.state.eligible.length; i++){
            if(this.state.selected == this.state.eligible[i]){
                this.state.eligible.splice(i, 1);
                break;
            }
        }
        
        record(meta, LogType.LOG, this.state.selected + " has declined " + this.state.picking);
        this.state.selected = "";
        this.onUpdate();
        // if eligible.length becomes 0 as a result, then we are done and call selectionComplete
        if(this.state.eligible.length == 0){
            this.selectionComplete(meta);
        }
    }

    getNextPicker(meta: IMetadata){

        this.state.picking = this.state.remaining.shift() as string;

        for(let i = 0; i < this.state.eligible.length; i++){
            if(this.state.picking == this.state.eligible[i]){
                this.state.eligible.splice(i, 1);
                break;
            }
        }
        record(meta, LogType.LOG, this.state.picking + " is now picking");
    }

    undo(meta: IMetadata){
        if(this.history.length == 0){
            record(meta, LogType.ERROR, "history is empty");
            return;
        }
        
        let pState: IAllianceStatus = this.history.splice(this.history.length-2, 1)[0] as IAllianceStatus;
        this.state = pState;
        console.log("previous picking: " + pState.picking);
        console.log("previous selected: " + pState.selected);

        record(meta, LogType.LOG, "undoing action")
        console.log("now picking: " + this.state.picking);
        console.log("currently selected: " + this.state.selected);
    }

    selectionComplete(meta: IMetadata){

        let output = "selection is now complete, alliances are:\n";
        for(let i = 0; i < this.state.alliances.length; i++){
            output += "seed " + (i+1) + ": " + this.state.alliances[i].team1 + " and " + this.state.alliances[i].team2 + "\n";
        }
        record(meta, LogType.LOG, output);
    }

    onUpdate(){

        this.history.push(JSON.parse(JSON.stringify(this.state)));
        // TODO: send data to clients
    }
}


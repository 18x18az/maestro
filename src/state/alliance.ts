import { DisplayState, IAllianceSelectionStatus, IAllianceTeams, MESSAGE_TYPE, TeamId } from "@18x18az/rosetta";
import { setDisplayState } from "../handlers/display";
import { getNumber } from "../handlers/teams";
import { record, IMetadata, LogType } from "../utils/log";
import { broadcast } from "../utils/wss";


let MAX_NUM_ALLIANCES = 16;

export class AllianceSelection {

    // current state
    state: IAllianceSelectionStatus = {
        picking: null,
        selected: null,
        eligible: [],
        remaining: [],
        alliances: []
    };

    // a stack of previous states
    history: Array<IAllianceSelectionStatus> = [];

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
        this.onUpdate(meta);
        setDisplayState(meta, DisplayState.ALLIANCE);
    }

    pick(team: TeamId, meta: IMetadata){

        if(!this.state.eligible.includes(team)){
            record(meta, LogType.ERROR, getNumber(team) + " is not in eligible")
            return;
        }

        this.state.selected = team;

        record(meta, LogType.LOG, getNumber(this.state.picking) + " has selected " + getNumber(this.state.selected));
        this.broadcastState(meta);
    } // end pick

    cancel(meta: IMetadata){
        record(meta, LogType.LOG, "cancelling current selection");
        if(!this.state.selected) {
            record(meta, LogType.ERROR, "No team selected");
        } else {
            this.state.selected = null;
            this.broadcastState(meta);
        }
    }

    accept(meta: IMetadata){

        if(this.state.selected == ""){
            record(meta, LogType.ERROR, "selected is empty");
            return;
        }

        // remove from eligible and remaining
        for(let i = 0; i < this.state.eligible.length; i++){
            if(this.state.selected == this.state.eligible[i]){
                this.state.eligible.splice(i, 1);
                break;
            }
        }

        for(let i = 0; i < this.state.remaining.length; i++){
            if(this.state.selected == this.state.remaining[i]){
                this.state.remaining.splice(i, 1);
                break;
            }
        }

        // make an alliance object and add it to this.state.alliances
        let alliance: IAllianceTeams = {
            team1: this.state.picking as string,
            team2: this.state.selected as string
        };
        this.state.alliances.push(alliance);
        
        
        record(meta, LogType.LOG, getNumber(this.state.selected) + " has accepted " + getNumber(this.state.picking));
        this.state.selected = "";
        // before getting the next picker, make sure we have teams remaining or 
        // we have already reached the max number of alliances

        if(this.state.alliances.length == MAX_NUM_ALLIANCES || this.state.remaining.length == 0 || this.state.eligible.length < 2){
            this.selectionComplete(meta);
            return;
        }

        this.getNextPicker(meta);
        this.onUpdate(meta);
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
        
        record(meta, LogType.LOG, getNumber(this.state.selected) + " has declined " + getNumber(this.state.picking));
        this.state.selected = "";
        this.onUpdate(meta);
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
        record(meta, LogType.LOG, getNumber(this.state.picking) + " is now picking");
    }

    undo(meta: IMetadata){
        if(this.history.length == 1){
            record(meta, LogType.ERROR, "history is empty");
            return;
        }
        
        let pState: IAllianceSelectionStatus = this.history.splice(this.history.length-2, 1)[0] as IAllianceSelectionStatus;
        this.state = pState;
        console.log("previous picking: " + pState.picking);
        console.log("previous selected: " + pState.selected);

        record(meta, LogType.LOG, "undoing action")
        console.log("now picking: " + this.state.picking);
        console.log("currently selected: " + this.state.selected);
        this.broadcastState(meta);
    }

    noShow(meta: IMetadata){
        record(meta, LogType.LOG, `${getNumber(this.state.picking)} is a no show`);
        this.getNextPicker(meta);
        this.onUpdate(meta);

        if(this.state.eligible.length == 0){
            this.selectionComplete(meta);
        }
    }

    selectionComplete(meta: IMetadata){

        let output = "selection is now complete, alliances are:\n";
        for(let i = 0; i < this.state.alliances.length; i++){
            output += "seed " + (i+1) + ": " + this.state.alliances[i].team1 + " and " + this.state.alliances[i].team2 + "\n";
        }
        record(meta, LogType.LOG, output);
        this.state.picking = null;
        this.broadcastState(meta);
    }

    onUpdate(meta: IMetadata){
        this.history.push(JSON.parse(JSON.stringify(this.state)));
        this.broadcastState(meta);
    }

    broadcastState(meta: IMetadata){
        broadcast(meta, {
            type: MESSAGE_TYPE.POST,
            path: ['allianceSelection'],
            payload: this.state
        });
    }
}


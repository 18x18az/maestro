import { Team, TeamId } from "@18x18az/rosetta";
import { getNextId, record, IMetadata, LogType } from "../utils/log";



// TODO: define this in rosetta
interface IAlliance {
    team1: TeamId
    team2: TeamId
}

interface IAllianceStatus{
    picking: TeamId | ""
    selected: TeamId | ""
    eligible: Array<TeamId> // can be picked by an alliance captain
    remaining: Array<TeamId> // can not be picked, but can still be alliance captain
    alliances: Array<IAlliance>
}

class AllianceSelection {

    maxAlliances: number;

    // current state
    state: IAllianceStatus = {
        picking: "",
        selected: "",
        eligible: [],
        remaining: [],
        alliances: []
    };

    // a stack of previous states
    history: Array<IAllianceStatus> = [];

    constructor(teams: Array<TeamId>){
        this.maxAlliances = 16;
        this.state.picking = teams[0];
        // TODO: finish this, ie populate eligible and remaining
    }

    // helper function for allianceselection
    generateMetaData(){
        var id = getNextId();
        var meta: IMetadata = {
            id
        }
        return meta;
    }

    pick(team: TeamId){
        // generate metadata
        var meta = this.generateMetaData();

        // check if team is in eligible
        let checkTeam = false;
        for(var i = 0; i < this.state.eligible.length; i++){
            if(team == this.state.eligible[i]){
                checkTeam = true;
            }
        }
        if(!checkTeam){
            record(meta, LogType.ERROR, team + " is not in eligible")
            return;
        }

        // TODO: do we wanna push history before checking for error? we probably should
        // TODO: call onUpdate() instead of doing this directly
        this.history.push(this.state);

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
        var meta = this.generateMetaData();

        if(this.state.selected == ""){
            record(meta, LogType.ERROR, "selected is empty");
        }

        // TODO: same as in pick()
        this.history.push(this.state);

        // make an alliance object and add it to this.state.alliances
        var alliance: IAlliance = {team1: this.state.picking, team2: this.state.selected };
        this.state.alliances.push(alliance);

        record(meta, LogType.LOG, this.state.selected + " has accepted " + this.state.picking);
        this.getNextPicker();

    } // end accept

    decline(){
        // generate metadata
        var meta = this.generateMetaData();
        
        if(this.state.selected == ""){
            record(meta, LogType.ERROR, "selected is empty");
        }

    }

    getNextPicker(){

    }

    undo(){

    }

    selectionComplete(){

    }

    onUpdate(){

    }
}


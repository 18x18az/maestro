import { TeamId } from "@18x18az/rosetta";
import { record, getNextId, LogType, IMetadata } from "./utils/log"
import { AllianceSelection } from "./state/alliance"
import ObsWebSocket from "obs-websocket-js";
import { SceneManager } from "./managers/scenemanager";

const id = getNextId();
const meta: IMetadata = {
    id
}

function doTheThing(metadata: IMetadata){
    record(metadata, LogType.LOG, "hello world");
}


doTheThing(meta);

let sm: SceneManager = new SceneManager('localhost:4444', meta);

/* // alliance selection test
let stdin = process.openStdin();

let teams: Array<string> = [];
for(let i = 1; i <= 38; i++){
    teams.push(i.toString());
}
let als: AllianceSelection = new AllianceSelection(teams, meta);


stdin.addListener("data", function(d) {
console.log("you entered: [" + d.toString().trim() + "]");
    switch(d.toString().trim()[0]){
        case "p":
            als.pick(d.toString().trim().substring(1), meta);
            break;
        case "a":
            als.accept(meta);
            break;
        case "d":
            als.decline(meta);
            break;
        case "u":
            als.undo(meta);
            break;
    }
});
*/
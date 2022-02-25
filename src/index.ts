import { record, IMetadata, LogType } from "./utils/log";
import { IMessage, MESSAGE_TYPE } from "@18x18az/rosetta";
import { getScoreHandler, postScoreHandler } from "./handlers/score";
import { getTeamsHandler, postTeamsHandler } from "./handlers/teams";
import { getFieldsHandler, postFieldsHandler} from "./handlers/fields";
import { getFieldHandler, postFieldHandler } from "./state/field";
import { getMatchesHandler, postMatchesHandler } from "./handlers/matches";
import { getAllianceSelectionHandler, postAllianceSelectionHandler } from "./handlers/allianceSelection";
import { getAwardsHandler, postAwardsHandler } from "./handlers/awards";
import { getDisplayStateHandler, postDisplayStateHandler } from "./handlers/display";

export function messageHandler(metadata: IMetadata, message: IMessage): IMessage | null {
    const route = message.path[0];
    const method = message.type;

    if (method === MESSAGE_TYPE.POST) {
        if (route === "score") {
            postScoreHandler(metadata, message);
        } else if (route === "teams") {
            postTeamsHandler(metadata, message);
        } else if (route === "field") {
            postFieldHandler(metadata, message);
        } else if (route === "matches") {
            postMatchesHandler(metadata, message);
        } else if (route === "allianceSelection") {
            postAllianceSelectionHandler(metadata, message);
        } else if (route === "fields"){
            postFieldsHandler(metadata, message);
        } else if (route === "awards") {
            postAwardsHandler(metadata, message);
        } else if (route === "display") {
            postDisplayStateHandler(metadata, message);
        } else {
            record(metadata, LogType.ERROR, `Unhandled POST path start ${route}`);
        }
    } else if (method === MESSAGE_TYPE.GET) {
        if (route === "teams") {
            return getTeamsHandler(metadata);
        } else if (route === "score") {
            return getScoreHandler(metadata);
        } else if (route === "matches") {
            return getMatchesHandler(metadata);
        } else if (route === "field") {
            return getFieldHandler(metadata);
        } else if (route === "fields") {
            return getFieldsHandler(metadata);
        } else if (route === "allianceSelection") {
            return getAllianceSelectionHandler(metadata);
        } else if (route === "display") {
            return getDisplayStateHandler(metadata);
        } else if(route === "awards") {
            return getAwardsHandler(metadata);
        } else {
            record(metadata, LogType.ERROR, `Unhandled GET path start ${route}`);
        }
    } else {
        record(metadata, LogType.ERROR, `Unhandled message type ${method}`);
    }

    return null;
}

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
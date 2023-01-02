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
import { getInspectionHandler, postInspectionHandler } from "./handlers/inspection";
import { getCompetitionStageHandler, postCompetitionStageHandler } from "./handlers/stage";

const postHandlers = new Map();
const getHandlers = new Map();

function registerHandler(route: string, postHandler: any, getHandler: any) {
    postHandlers.set(route, postHandler);
    getHandlers.set(route, getHandler);
}

registerHandler("score", postScoreHandler, getScoreHandler);
registerHandler("teams", postTeamsHandler, getTeamsHandler);
registerHandler("field", postFieldHandler, getFieldHandler);
registerHandler("matches", postMatchesHandler, getMatchesHandler);
registerHandler("allianceSelection", postAllianceSelectionHandler, getAllianceSelectionHandler);
registerHandler("fields", postFieldsHandler, getFieldsHandler);
registerHandler("awards", postAwardsHandler, getAwardsHandler);
registerHandler("display", postDisplayStateHandler, getDisplayStateHandler);
registerHandler("inspection", postInspectionHandler, getInspectionHandler);
registerHandler("stage", postCompetitionStageHandler, getCompetitionStageHandler);

export function messageHandler(metadata: IMetadata, message: IMessage): IMessage | null {
    const route = message.path[0];
    const method = message.type;

    if (method === MESSAGE_TYPE.POST) {
        const handler = postHandlers.get(route);
        if(handler == undefined){
            record(metadata, LogType.ERROR, `Unhandled POST path start ${route}`);
            return null;
        }
        handler(metadata, message);
    } else if (method === MESSAGE_TYPE.GET) {
        const handler = getHandlers.get(route);
        if(handler == undefined){
            record(metadata, LogType.ERROR, `Unhandled GET path start ${route}`);
            return null;
        }
        return handler(metadata);
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
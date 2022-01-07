import { record, IMetadata, LogType } from "./utils/log";
import { IMessage } from "@18x18az/rosetta";
import { ScoreHandler as scoreHandler } from "./handlers/score";

export function messageHandler(metadata: IMetadata, message: IMessage): IMessage | null{
    const route = message.path[0];
    if(route === "score"){
        scoreHandler(metadata, message);
    } else {
        record(metadata, LogType.ERROR, `Unknown path start ${route}`)
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
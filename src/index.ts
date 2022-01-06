import { getNextId, record, IMetadata, LogType } from "./utils/log";
import WebSocket from "ws";
import { IMessage, SimpleMatchResult } from "@18x18az/rosetta";

const wss = new WebSocket.Server({
    port: 8081
});

function messageHandler(metadata: IMetadata, message: IMessage): string | null{
    const route = message.path[0];
    if(route === "score"){
        const score = JSON.parse(message.payload) as SimpleMatchResult;
        console.log(score);
    } else {
        record(metadata, LogType.ERROR, `Unknown path start ${route}`)
    }

    return null;
}

function send(metadata: IMetadata, ws: WebSocket, message: any){
    record(metadata, LogType.LOG, `TX - ${message}`);
    ws.send(JSON.stringify({
        type: "POST",
        path: ["test"],
        payload: message
    }));
}

wss.on('connection', function connection(ws) {
    console.log("Connection");
    ws.on('message', function message(data) {
        const message = JSON.parse(data.toString()) as IMessage;
        const id = getNextId();
        const metadata: IMetadata = {id};
        record(metadata, LogType.LOG, `RX - ${JSON.stringify(message)}`);
        const reply = messageHandler(metadata, message);
        send(metadata, ws, reply);
    });
});

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
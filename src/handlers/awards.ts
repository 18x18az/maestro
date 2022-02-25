import { IMessage, MESSAGE_TYPE, IAward, IAwards, DisplayState } from "@18x18az/rosetta";
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";
import { setDisplayState } from "./display";

let awards: IAwards;
let selectedAward: IAward;

function refreshAwards(metadata: IMetadata) {
    record(metadata, LogType.LOG, "awards refresh requested");
    broadcast(metadata, {
        type: MESSAGE_TYPE.GET,
        path: ["awards"]
    });
}

export function postAwardsHandler(metadata: IMetadata, message: IMessage) {
    if(message.payload === null){
        refreshAwards(metadata);
    } else if(message.path[1] === "selected"){
        record(metadata, LogType.LOG, 'Award selected');
        const messageIndex = parseInt(message.payload)
        selectedAward = awards[messageIndex];
        record(metadata, LogType.LOG, `Selected ${selectedAward.name}`);
        setDisplayState(metadata, DisplayState.AWARD);
        broadcast(metadata, {
            type: MESSAGE_TYPE.POST,
            path: ["awards", "selected"],
            payload: selectedAward
        })
    } else {
        record(metadata, LogType.LOG, "awards updated");
        awards = message.payload;
        broadcast(metadata, {
            type: MESSAGE_TYPE.POST,
            path: ["awards"],
            payload: awards
        })
    }
}
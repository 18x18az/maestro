import { IMessage, MESSAGE_TYPE, IAward, IAwards, DisplayState } from "@18x18az/rosetta";
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";
import { setDisplayState } from "./display";

let awards: IAwards;
let selectedAward: IAward;
let isPushed: boolean;

function refreshAwards(metadata: IMetadata) {
    record(metadata, LogType.LOG, "awards refresh requested");
    broadcast(metadata, {
        type: MESSAGE_TYPE.GET,
        path: ["awards"]
    });
}

function getSelectedAward(): IAward{
    if(isPushed){
        return selectedAward;
    } else {
        let modified = JSON.parse(JSON.stringify(selectedAward)) as IAward;
        modified.winner = null;
        return modified;
    }
}

export function postAwardsHandler(metadata: IMetadata, message: IMessage) {
    if(message.payload === null){
        if(message.path[1] === "push") {
            isPushed = true;
            broadcast(metadata, {
                type: MESSAGE_TYPE.POST,
                path: ["awards", "selected"],
                payload: getSelectedAward()
            });
        } else {
            refreshAwards(metadata);
        }
    } else if(message.path[1] === "selected"){
        isPushed = false;
        record(metadata, LogType.LOG, 'Award selected');
        const messageIndex = parseInt(message.payload)
        selectedAward = awards[messageIndex];
        record(metadata, LogType.LOG, `Selected ${selectedAward.name}`);
        setDisplayState(metadata, DisplayState.AWARD);
        broadcast(metadata, {
            type: MESSAGE_TYPE.POST,
            path: ["awards", "selected"],
            payload: getSelectedAward()
        });
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

export function getAwardsHandler(meta: IMetadata): IMessage | null{
    record(meta, LogType.LOG, "Selected award requested");
    if(selectedAward){
        return {
            type: MESSAGE_TYPE.POST,
            path: ['awards', 'selected'],
            payload: getSelectedAward()
        }
    } else {
        return null
    }
}

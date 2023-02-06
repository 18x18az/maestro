import { IMessage, MESSAGE_TYPE, IAward, IAwards, COMPETITION_STAGE, DISPLAY_STATE } from "@18x18az/rosetta";
import { cueNext, getSelectedAward, selectAward, updateAwards } from "../state/award";
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";
import { setDisplayState } from "./display";

let selectedAward: IAward | null;
let isPushed: boolean;

function refreshAwards(metadata: IMetadata) {
    record(metadata, LogType.LOG, "awards refresh requested");
    broadcast(metadata, {
        type: MESSAGE_TYPE.GET,
        path: ["awards"]
    });
}

export function postAwardsHandler(metadata: IMetadata, message: IMessage) {
    if (message.payload === null) {
        if (message.path[1] === "push") {
            cueNext(metadata);
        } else if (message.path[1] === "selected") {
            record(metadata, LogType.LOG, 'Deselecting award');
            selectedAward = null;
            isPushed = false;
            broadcast(metadata, {
                type: MESSAGE_TYPE.POST,
                path: ["awards", "selected"],
                payload: getSelectedAward()
            });
        } else {
            refreshAwards(metadata);
        }
    } else if (message.path[1] === "selected") {
        const messageIndex = parseInt(message.payload)
        selectAward(metadata, messageIndex);
    } else {
        updateAwards(metadata, message.payload)
    }
}

export function getAwardsHandler(meta: IMetadata): IMessage | null {
    record(meta, LogType.LOG, "Selected award requested");
    const award = getSelectedAward()
    if (award) {
        return {
            type: MESSAGE_TYPE.POST,
            path: ['awards', 'selected'],
            payload: award
        }
    } else {
        return null
    }
}

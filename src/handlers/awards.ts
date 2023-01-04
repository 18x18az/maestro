import { IMessage, MESSAGE_TYPE, IAward, IAwards, COMPETITION_STAGE, DISPLAY_STATE } from "@18x18az/rosetta";
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";
import { setDisplayState } from "./display";
import { setCompetitionStage } from "./stage";

let awards: IAwards;
let selectedAward: IAward | null;
let isPushed: boolean;

function refreshAwards(metadata: IMetadata) {
    record(metadata, LogType.LOG, "awards refresh requested");
    broadcast(metadata, {
        type: MESSAGE_TYPE.GET,
        path: ["awards"]
    });
}

function getSelectedAward(): IAward | null {
    if (!selectedAward) {
        return null
    }

    if (isPushed) {
        return selectedAward;
    } else {
        let modified = JSON.parse(JSON.stringify(selectedAward)) as IAward;
        modified.winner = null;
        return modified;
    }
}

function selectAward(metadata: IMetadata, index: number) {
    const awardToUse = JSON.parse(JSON.stringify(awards[index]));
    record(metadata, LogType.LOG, 'Award selected');
    record(metadata, LogType.LOG, `Selected ${awardToUse.name}`);
    selectedAward = awardToUse;
    isPushed = false;
    setDisplayState(metadata, DISPLAY_STATE.NONE);
    setCompetitionStage(metadata, COMPETITION_STAGE.AWARDS);
    broadcast(metadata, {
        type: MESSAGE_TYPE.POST,
        path: ["awards", "selected"],
        payload: getSelectedAward()
    });
}

export function postAwardsHandler(metadata: IMetadata, message: IMessage) {
    if (message.payload === null) {
        if (message.path[1] === "push") {
            record(metadata, LogType.LOG, 'Award pushed to display');
            isPushed = true;
            broadcast(metadata, {
                type: MESSAGE_TYPE.POST,
                path: ["awards", "selected"],
                payload: getSelectedAward()
            });
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
        record(metadata, LogType.LOG, "awards updated");
        awards = message.payload;
        broadcast(metadata, {
            type: MESSAGE_TYPE.POST,
            path: ["awards"],
            payload: awards
        })
    }
}

export function getAwardsHandler(meta: IMetadata): IMessage | null {
    record(meta, LogType.LOG, "Selected award requested");
    if (selectedAward) {
        return {
            type: MESSAGE_TYPE.POST,
            path: ['awards', 'selected'],
            payload: getSelectedAward()
        }
    } else {
        return null
    }
}

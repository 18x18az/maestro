import { COMPETITION_STAGE, IMessage, MESSAGE_TYPE } from "@18x18az/rosetta";
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";

let stage: COMPETITION_STAGE = COMPETITION_STAGE.IDLE;

export function setCompetitionStage(metadata: IMetadata, state: COMPETITION_STAGE){
    stage = state;
    record(metadata, LogType.LOG, `competition stage updated to ${state}`);
    broadcast(
        metadata, {
            type: MESSAGE_TYPE.POST,
            path: ['stage'],
            payload: state
        }
    )
}

export function postCompetitionStageHandler(metadata: IMetadata, message: IMessage) {
    setCompetitionStage(metadata, message.payload);
};

export function getCompetitionStageHandler(metadata: IMetadata): IMessage {
    record(metadata, LogType.LOG, 'competition requested');
    return {
        type: MESSAGE_TYPE.POST,
        path: ['stage'],
        payload: stage
    }
}

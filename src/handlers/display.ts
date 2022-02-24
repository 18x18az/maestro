import { DisplayState, IMessage, MESSAGE_TYPE } from "@18x18az/rosetta";
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";

let display: DisplayState = DisplayState.UPCOMING;

export function setDisplayState(metadata: IMetadata, state: DisplayState){
    display = state;
    record(metadata, LogType.LOG, `display state updated to ${state}`);
    broadcast(
        metadata, {
            type: MESSAGE_TYPE.POST,
            path: ['display'],
            payload: state
        }
    )
}

export function postDisplayStateHandler(metadata: IMetadata, message: IMessage) {
    setDisplayState(metadata, message.payload);
};

export function getDisplayStateHandler(metadata: IMetadata): IMessage {
    record(metadata, LogType.LOG, 'display state requested');
    return {
        type: MESSAGE_TYPE.POST,
        path: ['display'],
        payload: display
    }
}

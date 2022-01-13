import { IMessage, MESSAGE_TYPE } from "@18x18az/rosetta";
import { AllianceSelection } from "../state/alliance";
import { IMetadata, LogType, record } from "../utils/log";
import { broadcast } from "../utils/wss";


let allianceSelection: AllianceSelection | null = null;

export function postAllianceSelectionHandler(meta: IMetadata, message: IMessage){
    if(!allianceSelection){
        if(message.payload) {
            record(meta, LogType.LOG, "rankings received, starting alliance selection");
            allianceSelection = new AllianceSelection(message.payload, meta);
            broadcast(meta, {
                type: MESSAGE_TYPE.POST,
                path: ['allianceSelection'],
                payload: allianceSelection.state
            })
        } else {
            record(meta, LogType.LOG, "alliance selection start requested, requesting current rankings");
            broadcast(meta, {
                type: MESSAGE_TYPE.GET,
                path: ['rankings']
            });
        }
    }
}

export function getAllianceSelectionHandler(meta: IMetadata){
    record(meta, LogType.LOG, "alliance selection state requested");
    return {
        type: MESSAGE_TYPE.POST,
        path: ['allianceSelection'],
        payload: allianceSelection?.state
    }
}
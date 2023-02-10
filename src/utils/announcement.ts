import { MESSAGE_TYPE } from "@18x18az/rosetta";
import { IMetadata, LogType, record } from "./log";
import { broadcast } from "./wss";

export async function announce(meta: IMetadata, announcement: string){
    record(meta, LogType.LOG, `Announcing ${announcement}}`);
    await broadcast(meta, {path: ["announce"], type: MESSAGE_TYPE.POST, payload: announcement});
}

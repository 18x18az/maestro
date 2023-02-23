import { IAnnouncement, MESSAGE_TYPE } from "@18x18az/rosetta";
import { IMetadata, LogType, record } from "./log";
import { broadcast } from "./wss";

export async function announce(meta: IMetadata, message: string){
    record(meta, LogType.LOG, `Announcing ${message}}`);
    const announcement: IAnnouncement = {message, uid: meta.id.toString()}
    await broadcast(meta, {path: ["announce"], type: MESSAGE_TYPE.POST, payload: announcement});
}

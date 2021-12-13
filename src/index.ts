import { record, getNextId, LogType, IMetadata } from "./utils/log"

const id = getNextId();
const meta: IMetadata = {
    id
}

function doTheThing(metadata: IMetadata){
    record(metadata, LogType.LOG, "hello world");
}

doTheThing(meta);


import { TeamId } from "@18x18az/rosetta";
import { record, getNextId, LogType, IMetadata } from "./utils/log"
import { AllianceSelection } from "./state/alliance"

const id = getNextId();
const meta: IMetadata = {
    id
}

function doTheThing(metadata: IMetadata){
    record(metadata, LogType.LOG, "hello world");
}


doTheThing(meta);

let stdin = process.openStdin();

let als: AllianceSelection = new AllianceSelection(["1", "2","3","4","5", "6","7", "8","9", "10","11", "12","13", "14","15", "16","17"], meta);

stdin.addListener("data", function(d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that  
    // with toString() and then substring() 

    console.log("you entered: [" + d.toString().trim() + "]");
    switch(d.toString().trim()[0]){
        case "p":
            als.pick(d.toString().trim().substring(1), meta);
            break;
        case "a":
            als.accept(meta);
            break;
        case "d":
            als.decline(meta);
            break;
        case "u":
            als.undo(meta);
            break;
    }
        
    

});

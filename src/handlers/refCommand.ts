import { IMessage, REF_COMMAND } from "@18x18az/rosetta";
import { displayMatch } from "../state/matchStage";
import { startMatch } from "../utils/fieldControl";
import { IMetadata } from "../utils/log";

export async function postRefCommandHandler(metadata: IMetadata, message: IMessage) {
    const command = message.payload;
    switch (command) {
        case REF_COMMAND.DISPLAY: {
            await displayMatch(metadata);
            break;
        }

        case REF_COMMAND.START: {
            await startMatch(metadata);
        }
    }
}

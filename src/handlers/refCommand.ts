import { IMessage, REF_COMMAND } from "@18x18az/rosetta";
import { display } from "../state/matchStage";
import { startMatch } from "../utils/fieldControl";
import { IMetadata } from "../utils/log";

export async function postRefCommandHandler(metadata: IMetadata, message: IMessage) {
    const command = message.payload;
    switch (command) {
        case REF_COMMAND.DISPLAY: {
            await display(metadata);
            break;
        }

        case REF_COMMAND.START: {
            await startMatch(metadata);
        }
    }
}

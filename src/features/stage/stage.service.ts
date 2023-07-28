import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from 'src/utils/storage/storage.service';
import { PublishService } from 'src/utils/publish/publish.service';
import { EVENT_STAGE } from '@18x18az/rosetta';

const EVENT_STAGE_KEY = 'eventStage';

@Injectable()
export class StageService {
    private readonly logger = new Logger(StageService.name);
    constructor(private readonly storage: StorageService, private readonly publisher: PublishService) { }

    async onApplicationBootstrap() {
        const existing = await this.getStage();

        if(existing === EVENT_STAGE.TEARDOWN) {
            this.logger.log("New event starting");
            await this.setStage(EVENT_STAGE.SETUP);
            return;
        }

        this.logger.log(`Event stage loaded at ${existing}`);
        await this.broadcastStage(existing);
    }

    async receivedTeams(): Promise<void> {
        if(await this.getStage() === EVENT_STAGE.SETUP) {
            await this.setStage(EVENT_STAGE.CHECKIN);
        }
    }

    private getStage(): Promise<EVENT_STAGE> {
        return this.storage.getPersistent(EVENT_STAGE_KEY, EVENT_STAGE.SETUP);
    }

    async setStage(stage: EVENT_STAGE): Promise<void> {
        this.logger.log(`Event stage set to ${stage}`);
        await this.storage.setPersistent(EVENT_STAGE_KEY, stage);
        await this.broadcastStage(stage);
    }

    private async broadcastStage(stage: EVENT_STAGE): Promise<void> {
        await this.publisher.broadcast(EVENT_STAGE_KEY, stage);
    }
}

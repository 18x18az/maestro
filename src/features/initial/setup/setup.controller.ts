import { Body, Controller, HttpException, HttpStatus, Inject, Logger, Param, Post } from '@nestjs/common';
import { EventCodeDto } from './eventCode.dto';
import { TeamService } from 'src/features/initial/team/team.service';
import { testTeamList } from './testTeamList';

enum STAGE {
    NONE = 'none',
    CODE = 'code',
    DONE = 'done'
}

@Controller('setup')
export class SetupController {
    private readonly logger = new Logger(SetupController.name);
    private stage: STAGE

    constructor(private readonly teamService: TeamService) {
        this.stage = STAGE.CODE
        this.teamService = teamService;
    }

    // @EventPattern('teams')
    // teamsUpdated(@Payload() teams: Team[]) {
    //     this.logger.log(teams);
    // }

    // @MqttSubscribe('scores/:matchId')
    // handleScore(@Param() params: any, message: string) {
    //     console.log(params.matchId)
    //     console.log('Received MQTT message:', message.toString());
    //     // Handle the received message
    // }

    @Post('eventCode')
    async submitEventCode(@Body() eventCode: EventCodeDto) {
        if (this.stage !== STAGE.CODE) {
            throw new HttpException('Not accepting event code', HttpStatus.CONFLICT);
        }

        if (eventCode.eventCode === 'test') {
            this.logger.log('Using fake team and schedule data for testing');
            this.teamService.createTeams(testTeamList);
            //this.stage = STAGE.DONE;
            return;
        }
        return;
    }
}

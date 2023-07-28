import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../utils/prisma/prisma.service';
import { Team } from './team.dto';
import { TeamInfo } from '@18x18az/rosetta';
import { PublishService } from '../../../utils/publish/publish.service';

@Injectable()
export class TeamService {
    private readonly logger = new Logger(TeamService.name);

    constructor(private readonly publisher: PublishService, private readonly prisma: PrismaService) {
    }

    async onApplicationBootstrap() {
        const existing = await this.prisma.team.findMany();

        if (existing.length === 0) {
            return;
        }

        this.logger.log(`Loaded ${existing.length} teams`);
        const existingTeamInfo = existing.map(team => { return { number: team.number, name: team.name, city: team.city, state: team.state, country: team.country, ageGroup: team.ageGroup } });
        await this.broadcastTeamInfo(existingTeamInfo);
    }

    private async broadcastTeamInfo(teams: Team[]) {
        const teamInfo: TeamInfo = {}
        teams.forEach(team => { teamInfo[team.number] = team });
        const teamList = teams.map(team => { return team.number });
        this.publisher.broadcast('teams', teamInfo);
        this.publisher.broadcast('teamList', teamList);
    }

    async createTeams(teams: Team[]): Promise<void> {
        const existing = await this.prisma.team.findMany();
        if(existing.length > 0) {
            this.logger.warn(`Attempted to create teams, but ${existing.length} teams already exist`);
            return;
        }
        this.logger.log(`Creating ${teams.length} teams`);
        teams.forEach(async (team) => {
            await this.prisma.team.create({
                data: {
                    name: team.name,
                    number: team.number,
                    city: team.city,
                    state: team.state,
                    country: team.country,
                    ageGroup: team.ageGroup
                }
            })
        })
        this.broadcastTeamInfo(teams);
    }
}

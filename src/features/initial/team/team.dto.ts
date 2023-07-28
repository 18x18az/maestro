import {Team as TeamDto} from '@18x18az/rosetta';

export class Team {
    readonly number: string;
    readonly name: string;
    readonly city: string;
    readonly state: string;
    readonly country: string;
    readonly ageGroup: string;

    constructor(info: TeamDto){
        this.number = info.number;
        this.name = info.name;
        this.city = info.city;
        this.state = info.state;
        this.country = info.country;
        this.ageGroup = info.ageGroup;
    }
}

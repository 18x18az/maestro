import { IsString } from "class-validator";

export class EventCodeDto {
    @IsString()
    public eventCode: string;

    @IsString()
    public tmCode: string;
}

import {
  InMemoryDBEntity,
  InMemoryDBService,
} from "@nestjs-addons/in-memory-db";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../utils/prisma/prisma.service";

export interface DisplayDetails extends InMemoryDBEntity {
  uuid: string;
  name: string;
  field: string;
}

@Injectable()
export class DisplaysDatabase {
  constructor(
    private readonly prisma: PrismaService,
    // @question in repo.service.ts, this is used, is it necessary here, and if so how should it be implemented?
    private readonly cache: InMemoryDBService<DisplayDetails>
  ) {}
  async setDisplayName(uuid: string, name: string): Promise<void> {
    this.prisma.display.upsert({
      create: {
        uuid,
        name,
        // @question I'm not sure what to do here because I don't fully understand how this will be consumed, so I will be using this placeholder
        field: "null",
      },
      update: { name },
      where: { uuid },
    });
  }
  async setField(uuid: string, field: string): Promise<void> {
    this.prisma.display.upsert({
      create: {
        uuid,
        // @question same here
        name: "null",
        field,
      },
      update: { field },
      where: { uuid },
    });
  }
  // @question is no specified return type fine here? (weird return type) 
  async getDetails(uuid: string) /*: Promise<DisplayDetails | null> */ {
    return await this.prisma.display.findUnique({ where: { uuid } });
  }
  async getField(uuid: string): Promise<string | undefined> {
    return (await this.getDetails(uuid))?.field;
  }
  async getName(uuid: string): Promise<string | undefined> {
    return (await this.getDetails(uuid))?.name;
  }
}

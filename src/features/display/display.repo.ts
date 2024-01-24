import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DisplayEntity } from './display.entity'
import { Repository } from 'typeorm'

@Injectable()
export class DisplayRepo {
  constructor (@InjectRepository(DisplayEntity) private readonly displayRepository: Repository<DisplayEntity>) { }

  async getDisplay (uuid: string): Promise<DisplayEntity | null> {
    return await this.displayRepository.findOneBy({ uuid })
  }

  async createDisplay (uuid: string): Promise<DisplayEntity> {
    const display = new DisplayEntity()
    display.uuid = uuid
    display.name = ''
    return await this.displayRepository.save(display)
  }

  async getDisplays (): Promise<DisplayEntity[]> {
    return await this.displayRepository.find()
  }
}

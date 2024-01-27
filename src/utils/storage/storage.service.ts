import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { PersistentEntity } from './persistent.entity'
import { Repository } from 'typeorm'
import { EphemeralEntity } from './ephemeral.entity'

@Injectable()
export class StorageService {
  constructor (
    @InjectRepository(PersistentEntity) private readonly persistentRepository: Repository<PersistentEntity>,
    @InjectRepository(EphemeralEntity) private readonly ephemeralRepository: Repository<EphemeralEntity>
  ) { }

  async setEphemeral (ident: string, value: string): Promise<void> {
    await this.ephemeralRepository.save({ key: ident, value })
  }

  async getEphemeral (ident: string, fallback: string): Promise<string> {
    const existing = await this.ephemeralRepository.findOneBy({ key: ident })

    if (existing === null) {
      await this.setEphemeral(ident, fallback)
      return fallback
    }

    return existing.value
  }

  async setPersistent (ident: string, value: string): Promise<void> {
    await this.persistentRepository.save({ key: ident, value })
  }

  async getPersistent (ident: string, fallback: string): Promise<string> {
    const existing = await this.persistentRepository.findOneBy({ key: ident })

    if (existing === null) {
      await this.setPersistent(ident, fallback)
      return fallback
    }

    return existing.value
  }

  async clearEphemeral (): Promise<void> {
    await this.ephemeralRepository.clear()
  }
}

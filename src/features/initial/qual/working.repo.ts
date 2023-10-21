import { Injectable } from '@nestjs/common'
import { QualMatch } from './qual-list.interface'

@Injectable()
export class WorkingRepo {
  private readonly qualMatches: QualMatch[] = []

  hydrateQuals (quals: QualMatch[]): void {
    if (this.qualMatches.length !== 0) {
      throw new Error('Quals already hydrated')
    }
    this.qualMatches.push(...quals)
  }
}

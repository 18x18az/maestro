import { BadRequestException, Injectable } from '@nestjs/common'

@Injectable()
export class SwitcherInternal {
  private previewScene?: number
  private programScene?: number

  private sceneChanged (): void {
    this.programScene = this.previewScene
    this.previewScene = undefined
  }

  async cutToScene (): Promise<void> {
    if (this.previewScene === undefined) {
      throw new BadRequestException('No preview scene set')
    }

    this.sceneChanged()
  }

  async transitionToScene (): Promise<void> {
    if (this.previewScene === undefined) {
      throw new BadRequestException('No preview scene set')
    }

    this.sceneChanged()
  }

  async setPreviewScene (id: number): Promise<void> {
    this.previewScene = id
  }

  getProgramScene (): number | undefined {
    return this.programScene
  }

  getPreviewScene (): number | undefined {
    return this.previewScene
  }
}

import { Args, Int, Mutation, Resolver } from '@nestjs/graphql'
import { Skills } from './skills.object'
import { SkillsService } from './skills.service'

@Resolver(() => Skills)
export class SkillsResolver {
  constructor (private readonly skillsService: SkillsService) {}

  @Mutation(() => Skills)
  async queueDriverSkills (@Args({ name: 'fieldId', type: () => Int }) fieldId): Promise<Skills> {
    await this.skillsService.queueDriverSkillsMatch(fieldId)
    const skills = await this.skillsService.getSkillsMatch(fieldId)
    if (skills === undefined) throw new Error('Could not find skills match')
    return skills
  }

  @Mutation(() => Skills)
  async queueProgrammingSkills (@Args({ name: 'fieldId', type: () => Int }) fieldId): Promise<Skills> {
    await this.skillsService.queueProgrammingSkillsMatch(fieldId)
    const skills = await this.skillsService.getSkillsMatch(fieldId)
    if (skills === undefined) throw new Error('Could not find skills match')
    return skills
  }
}

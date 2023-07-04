import { AUTH_TYPE, PathComponent, TeamInfo, TeamInfoTable } from '@18x18az/rosetta'
import { InputProcessor, SingleModule, addSimpleSingleBroadcast, addSimpleSingleDatabase, addSimpleSinglePostHandler } from '../../components'

const processor: InputProcessor<TeamInfoTable> = (input, current) => {
  const teams = input.get(PathComponent.TEAM_INFO) as TeamInfo[]
  if (teams !== undefined) {
    const output: TeamInfoTable = {}
    teams.forEach((team, index) => {
      const identifier = index.toString()
      output[identifier] = team
    })
    console.log('team info received')
    return output
  }
}

export async function setupTeamInfo (): Promise<void> {
  const module = new SingleModule(PathComponent.TEAM_INFO, processor)

  addSimpleSinglePostHandler(module, PathComponent.TEAM_INFO, AUTH_TYPE.SERVICE)
  addSimpleSingleBroadcast(module, PathComponent.TEAM_INFO)

  await addSimpleSingleDatabase(module, undefined)
  console.log('Team Info module loaded')
}

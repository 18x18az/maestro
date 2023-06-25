import { ConnectionState } from '@18x18az/rosetta'
import { Request, Response } from 'express'
import { setDatabaseState, setMobileState, setWebState } from '../controllers/middleman'

export const controller = async (req: Request, res: Response): Promise<void> => {
  const service = req.params.service
  const component = req.params.component
  const state = req.body.state as ConnectionState

  if (service === 'middleman') {
    switch (component) {
      case 'mobile': {
        await setMobileState(state)
        break
      }
      case 'web': {
        await setWebState(state)
        break
      }
      case 'database': {
        await setDatabaseState(state)
        break
      }
      default: {
        console.log(`Unknown middleman component ${component}`)
      }
    }
  } else {
    console.log(`Service ${service} component ${component} is now ${state}`)
  }

  res.end()
}

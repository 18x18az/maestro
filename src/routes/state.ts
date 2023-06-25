import { ConnectionInfo } from '@18x18az/rosetta'
import { Request, Response } from 'express'
import { setDatabaseState, setMobileState, setWebState } from '../controllers/middleman'

export const controller = async (req: Request, res: Response): Promise<void> => {
  const service = req.params.service
  const component = req.params.component
  const info = req.body as ConnectionInfo

  if (service === 'middleman') {
    switch (component) {
      case 'mobile': {
        await setMobileState(info)
        break
      }
      case 'web': {
        await setWebState(info)
        break
      }
      case 'database': {
        await setDatabaseState(info)
        break
      }
      default: {
        console.log(`Unknown middleman component ${component}`)
      }
    }
  } else {
    console.log(`Service ${service} component ${component} is now ${info.state}`)
  }

  res.end()
}

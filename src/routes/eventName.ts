import { Request, Response } from 'express'
import { setEventName } from '../controllers/eventName'

export const controller = async (req: Request, res: Response): Promise<void> => {
  const name = req.body.name
  await setEventName(name)
  res.end()
}

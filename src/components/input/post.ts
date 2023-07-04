import { Request, Response } from 'express'
import { BaseModule, MultiModule, Update } from '../base/module'
import { AUTH_TYPE, MessagePath } from '@18x18az/rosetta'
import { isAuthorized } from '../auth/auth'
import { makeApiPath } from '../utils/pathBuilder'
import { apiRouter } from '../../services/api'

type BaseCb = (req: Request, res: Response) => Promise<void>
export type CommonPostHandler = PostHandler | DiscerningPostHandler
export type PostHandler = (req: Request, res: Response) => Promise<Update | undefined>
export type DiscerningPostHandler = (req: Request, res: Response) => Promise<Array<[identifier: string, update: Update]> | undefined>

export function postHandlerFactory<DataShape> (handler: CommonPostHandler, authorization: AUTH_TYPE, validator?: (data: DataShape) => boolean): CommonPostHandler {
  const wrappedHandler: PostHandler = async (req, res) => {
    const auth = await isAuthorized(req, authorization)
    if (!auth) {
      res.status(401).send()
      return
    }

    if (validator !== undefined) {
      const isValid = validator(req.body)
      if (!isValid) {
        res.status(400).send()
        return
      }
    }

    return await handler(req, res)
  }

  return wrappedHandler
}

export function addDiscerningPostHandler (module: MultiModule<any>, topic: MessagePath, handler: DiscerningPostHandler): void {
  const wrapperFunction: BaseCb = async (req, res) => {
    const updates = await handler(req, res)
    if (updates === undefined) {
      return
    }
    const promises = updates.map(async update => {
      await module.updateInstance(update[0], update[1])
    })
    await Promise.all(promises)
    res.status(200).send()
  }
  baseHandlePost(topic, wrapperFunction)
}

export function addPostHandler (module: BaseModule<any>, topic: MessagePath, handler: PostHandler): void {
  const wrapperFunction: BaseCb = async (req, res) => {
    const update = await handler(req, res)
    if (update === undefined) {
      return
    }
    const result = await module.updateAll(update)
    if (result) {
      res.status(200).send()
    }
  }
  baseHandlePost(topic, wrapperFunction)
}

function baseHandlePost (path: MessagePath, cb: (req: Request, res: Response) => Promise<void>): void {
  const pathString = makeApiPath(path)
  apiRouter.post(pathString, (req, res) => { void cb(req, res) })
}

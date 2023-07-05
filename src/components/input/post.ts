import { Request, Response } from 'express'
import { BaseModule, MultiModule, R } from '../base/module'
import { AUTH_TYPE, MessagePath } from '@18x18az/rosetta'
import { isAuthorized } from '../auth/auth'
import { makeApiPath } from '../utils/pathBuilder'
import { apiRouter } from '../../services/api'

type BaseCb = (req: Request, res: Response) => Promise<void>
type PostResult<InputShape extends R> = Partial<InputShape> | undefined
type DiscerningPostResult<InputShape extends R> = Array<[string, Partial<InputShape>]> | undefined
export type CommonPostHandler<InputShape extends R> = PostHandler<InputShape> | DiscerningPostHandler<InputShape>
export type PostHandler<InputShape extends R> = (req: Request, res: Response) => Promise<PostResult<InputShape>>
export type DiscerningPostHandler<InputShape extends R> = (req: Request, res: Response) => Promise<DiscerningPostResult<InputShape>>
export type Validator<DataShape> = (data: DataShape) => boolean

export function postHandlerFactory<InputShape extends R, BodyShape > (handler: (req: Request, res: Response) => any, authorization: AUTH_TYPE, validator?: Validator<BodyShape>): (req: Request, res: Response) => any {
  const wrappedHandler: CommonPostHandler<InputShape> = async (req, res) => {
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

    const result = await handler(req, res)
    return result
  }

  return wrappedHandler
}

export function addDiscerningPostHandler<InputShape extends R> (module: MultiModule<InputShape, any>, topic: MessagePath, handler: DiscerningPostHandler<InputShape>): void {
  const wrapperFunction: BaseCb = async (req, res) => {
    const updates = await handler(req, res)
    if (updates === undefined) {
      return
    }
    const promises = updates.map(async update => {
      const result = await module.updateInstance(update[0], update[1])
      return result
    })
    const result = await Promise.all(promises)

    if (result.includes(false)) {
      res.status(400).send()
      return
    }

    res.status(200).send()
  }
  baseHandlePost(topic, wrapperFunction)
}

export function addPostHandler<InputShape extends R, OutputShape> (module: BaseModule<InputShape, OutputShape>, topic: MessagePath, handler: PostHandler<InputShape>): void {
  const wrapperFunction: BaseCb = async (req, res) => {
    const update = await handler(req, res)
    if (update === undefined) {
      return
    }
    const result = await module.updateAll(update)
    if (result) {
      res.status(200).send()
    } else {
      res.status(409).send()
    }
  }
  baseHandlePost(topic, wrapperFunction)
}

function baseHandlePost (path: MessagePath, cb: (req: Request, res: Response) => Promise<void>): void {
  const pathString = makeApiPath(path)
  apiRouter.post(pathString, (req, res) => { void cb(req, res) })
}

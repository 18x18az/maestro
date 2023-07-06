import { AUTH_TYPE, MessagePath, PathComponent } from '@18x18az/rosetta'
import { BaseModule, MultiModule, R } from '../base/module'
import { DiscerningPostHandler, PostHandler, Validator, addDiscerningPostHandler, addPostHandler, postHandlerFactory } from './post'

function simpleSinglePostHandlerFactory<InputShape extends R> (
  resource: keyof InputShape & PathComponent,
  authorization: AUTH_TYPE,
  validator?: Validator<any>
): PostHandler<InputShape> {
  const singlePostHandler: PostHandler<InputShape> = async (req, res) => {
    const value = req.body
    const ret: Partial<InputShape> = { [resource]: value } as any
    return ret
  }

  const handler = postHandlerFactory(singlePostHandler, authorization, validator)

  return handler
}

export const addSimpleSinglePostHandler = <InputShape extends R>(module: BaseModule<InputShape, any>, resource: keyof InputShape & PathComponent, authorization: AUTH_TYPE, validator?: Validator<any>): void => {
  const handler = simpleSinglePostHandlerFactory<InputShape>(resource, authorization, validator)
  addPostHandler(module, [[], resource], handler)
}

function simpleDiscerningPostHandlerFactory<InputShape extends R> (resource: keyof InputShape & PathComponent, authorization: AUTH_TYPE, validator?: Validator<any>): DiscerningPostHandler<InputShape> {
  const simpleDiscerningPostHandler: DiscerningPostHandler<InputShape> = async (req, res) => {
    const identifier = req.params.identifier
    const update = req.body

    const updateVal: Partial<InputShape> = {}
    updateVal[resource] = update

    return [[identifier, updateVal]]
  }

  const handler = postHandlerFactory(simpleDiscerningPostHandler, authorization, validator)
  return handler
}

export const addSimpleDiscerningPostHandler = <InputShape extends R>(
  module: MultiModule<InputShape, any>,
  discriminator: PathComponent,
  resource: keyof InputShape & PathComponent,
  authorization: AUTH_TYPE,
  validator?: Validator<any>
): void => {
  const handler = simpleDiscerningPostHandlerFactory<InputShape>(resource, authorization, validator)
  const path: MessagePath = [[[discriminator, ':identifier']], resource]
  addDiscerningPostHandler(module, path, handler)
}

import { AUTH_TYPE, MessagePath, PathComponent } from '@18x18az/rosetta'
import { BaseModule, MultiModule } from '../base/module'
import { DiscerningPostHandler, PostHandler, Validator, addDiscerningPostHandler, addPostHandler, postHandlerFactory } from './post'

function simpleSinglePostHandlerFactory (resource: PathComponent, authorization: AUTH_TYPE, validator?: Validator<any>): PostHandler {
  const singlePostHandler: PostHandler = async (req, res) => {
    const value = req.body
    return [[resource, value]]
  }

  const handler = postHandlerFactory(singlePostHandler, authorization, validator)

  return handler
}

export const addSimpleSinglePostHandler = (module: BaseModule<any>, resource: PathComponent, authorization: AUTH_TYPE, validator?: Validator<any>): void => {
  const handler = simpleSinglePostHandlerFactory(resource, authorization, validator)
  addPostHandler(module, [[], resource], handler)
}

function simpleDiscerningPostHandlerFactory (resource: PathComponent, authorization: AUTH_TYPE, validator?: Validator<any>): DiscerningPostHandler {
  const simpleDiscerningPostHandler: DiscerningPostHandler = async (req, res) => {
    const identifier = req.params.identifier
    const update = req.body

    return [[identifier, [[resource, update]]]]
  }

  const handler = postHandlerFactory(simpleDiscerningPostHandler, authorization, validator)
  return handler
}

export const addSimpleDiscerningPostHandler = (
  module: MultiModule<any>,
  discriminator: PathComponent,
  resource: PathComponent,
  authorization: AUTH_TYPE,
  validator?: Validator<any>
): void => {
  const handler = simpleDiscerningPostHandlerFactory(resource, authorization, validator)
  const path: MessagePath = [[[discriminator, ':identifier']], resource]
  addDiscerningPostHandler(module, path, handler)
}

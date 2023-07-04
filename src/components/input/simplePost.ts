import { AUTH_TYPE, PathComponent } from '@18x18az/rosetta'
import { BaseModule } from '../base/module'
import { PostHandler, Validator, addPostHandler, postHandlerFactory } from './post'

function simpleSinglePostHandlerFactory (resource: PathComponent, authorization: AUTH_TYPE, validator?: Validator<any>): PostHandler {
  const codeHandler: PostHandler = async (req, res) => {
    const value = req.body
    return [[resource, value]]
  }

  const handler = postHandlerFactory(codeHandler, authorization, validator)

  return handler
}

export const addSimpleSinglePostHandler = (module: BaseModule<any>, resource: PathComponent, authorization: AUTH_TYPE, validator?: Validator<any>): void => {
  const handler = simpleSinglePostHandlerFactory(resource, authorization, validator)
  addPostHandler(module, [[], resource], handler)
}

import { MOCK_RETURN_VALUE, MOCK_TOPIC, MOCK_TOPIC_END } from '../../__test__/mockValues'
import { addSimpleSingleBroadcast } from './simplePublish'

import * as publish from './publish'

const spy = jest.spyOn(publish, 'addBroadcastOutput').mockImplementation(() => {})

describe('addSimpleSingleBroadcast', () => {
  it('should add a broadcast output to the module', () => {
    addSimpleSingleBroadcast(module as any, MOCK_TOPIC_END)
    const handler = spy.mock.calls[0][1]
    const handlerOutput = handler('', MOCK_RETURN_VALUE)
    expect(handlerOutput).toEqual([MOCK_TOPIC, MOCK_RETURN_VALUE])
  })
})

import { MessagePath, PathComponent } from '@18x18az/rosetta'

export interface MockInput {
  firstValue: string
  secondValue: string
}

export const IDENTIFIER = 'TEST'

export const MOCK_VALUE_1 = 'FOO'
export const MOCK_VALUE_2 = 'BAR'

export const MOCK_SINGLE_UPDATE: Partial<MockInput> = { firstValue: MOCK_VALUE_1 }
export const MOCK_DOUBLE_UPDATE: Partial<MockInput> = { firstValue: MOCK_VALUE_1, secondValue: MOCK_VALUE_2 }
export const MOCK_SECOND_UPDATE: Partial<MockInput> = { secondValue: MOCK_VALUE_2 }

export const MOCK_RETURN_VALUE = 'FIZZ'
export const MOCK_SECOND_RETURN_VALUE = 'BUZZ'

export const MOCK_TOPIC_END = PathComponent.EVENT_STATE
export const MOCK_TOPIC: MessagePath = [[], MOCK_TOPIC_END]

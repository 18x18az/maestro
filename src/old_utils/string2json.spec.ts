import { makeString, makeValue } from './string2json'

describe('string2json', () => {
  describe('makeString', () => {
    it('should return the string if the value passed is already a string', () => {
      const input = 'test'

      const output = makeString(input)

      expect(output).toEqual(input)
    })

    it('should return the string representation of a number if the value passed is a number', () => {
      const input = 42

      const output = makeString(input)

      expect(output).toEqual('42')
    })

    it('should return the JSON representation of an object if the value passed is an object', () => {
      const input = { foo: 'bar' }

      const output = makeString(input)

      expect(output).toEqual('{"foo":"bar"}')
    })
  })

  describe('makeValue', () => {
    it('should return the parsed JSON if the input is a valid JSON string', () => {
      const input = '{"foo":"bar"}'

      const output = makeValue(input)

      expect(output).toEqual({ foo: 'bar' })
    })

    it('should return the input if the input is not a valid JSON string', () => {
      const input = 'foo'

      const output = makeValue(input)

      expect(output).toEqual(input)
    })
  })
})

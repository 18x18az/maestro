import { MessagePath } from '@18x18az/rosetta'

export function makeMqttPath (components: MessagePath): string {
  const leading = components[0].map((block) => { return block.join('/') }).join('/')
  const end = components[1]
  if (leading !== '') {
    return [leading, end].join('/')
  } else {
    return end
  }
}

export function makeApiPath (components: MessagePath): string {
  const leading = components[0].map((block) => { return block.join('/') }).join('/')
  const end = components[1]
  let output: string
  if (leading !== '') {
    output = [leading, end].join('/')
  } else {
    output = end
  }
  output = `/${output}`
  return output
}

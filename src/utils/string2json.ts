export function makeString (value: any): string {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number') {
    return value.toString()
  }

  return JSON.stringify(value)
}

export function makeValue (input: string): any {
  try {
    const parsed = JSON.parse(input)
    return parsed
  } catch {
    return input
  }
}

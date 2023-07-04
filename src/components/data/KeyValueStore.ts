import { prisma } from '../../utils/prisma'

export async function loadValueForKey (id: string): Promise<string | undefined> {
  const existing = await prisma.configStore.findFirst({ where: { id } })
  if (existing === null) {
    return
  }
  let value = existing.value
  try {
    value = JSON.parse(value)
  } catch (err) {

  }
  return value
}

export async function saveValueForKey (id: string, value: any): Promise<void> {
  let saved: string
  if (typeof (value) === 'object') {
    saved = JSON.stringify(value)
  } else {
    saved = value
  }
  await prisma.configStore.upsert({
    where: { id },
    update: { value: saved },
    create: { id, value: saved }
  })
}

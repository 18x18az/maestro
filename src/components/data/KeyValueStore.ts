import { prisma } from '../../utils/prisma'
import { GenericObject } from './database'

export async function loadValueForKey<DataShape extends GenericObject> (id: string): Promise<DataShape | undefined> {
  const existing = await prisma.configStore.findFirst({ where: { id } })
  if (existing === null) {
    return
  }
  const value = existing.value
  try {
    const objValue = JSON.parse(value) as DataShape
    return objValue
  } catch (err) {

  }
  return value as DataShape
}

export async function saveValueForKey<DataShape extends GenericObject> (id: string, value: DataShape): Promise<void> {
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

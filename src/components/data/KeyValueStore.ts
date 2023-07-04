import { prisma } from '../../utils/prisma'

export async function loadValueForKey (id: string): Promise<string | undefined> {
  console.log('Loading saved data')
  const existing = await prisma.configStore.findFirst({ where: { id } })
  if (existing === null) {
    return
  }
  return existing.value
}

export async function saveValueForKey (id: string, value: string): Promise<void> {
  await prisma.configStore.upsert({
    where: { id },
    update: { value },
    create: { id, value }
  })
}

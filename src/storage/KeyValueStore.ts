import { prisma } from '../utils/prisma'

export async function loadValueForKey (id: string, fallback: string): Promise<string> {
  const existing = await prisma.configStore.findFirst({ where: { id } })
  if (existing === null) {
    return fallback
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

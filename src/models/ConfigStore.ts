import { prisma } from '../utils/prisma'

export async function getConfig (id: string, fallback: string): Promise<string> {
  const existing = await prisma.configStore.findFirst({ where: { id } })
  if (existing === null) {
    await setConfig(id, fallback)
    return fallback
  }
  return existing.value
}

export async function setConfig (id: string, value: string): Promise<void> {
  await prisma.configStore.create({ data: { id, value } })
}

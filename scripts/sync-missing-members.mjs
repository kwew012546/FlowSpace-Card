import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const projects = await prisma.project.findMany()
  console.log(`Found ${projects.length} projects. Checking owner membership...`)

  for (const p of projects) {
    const exists = await prisma.projectMember.findFirst({
      where: { projectId: p.id, userId: p.ownerId }
    })
    if (!exists) {
      await prisma.projectMember.create({
        data: { projectId: p.id, userId: p.ownerId }
      })
      console.log(`✅ Linked owner (${p.ownerId}) to project ${p.id} (${p.name})`)
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())

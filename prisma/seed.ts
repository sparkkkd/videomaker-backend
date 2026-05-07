import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'admin',
    12,
  )

  await prisma.adminUser.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@example.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: hashedPassword,
    },
  })

  const tabs = [
    { label: 'Моушен-дизайн', slug: 'motion-design', order: 0 },
    { label: 'Видеомонтаж', slug: 'video-editing', order: 1 },
    { label: '3D Графика', slug: '3d-graphics', order: 2 },
  ]

  for (const tab of tabs) {
    await prisma.tab.upsert({
      where: { slug: tab.slug },
      update: {},
      create: tab,
    })
  }

  console.log('✅ Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

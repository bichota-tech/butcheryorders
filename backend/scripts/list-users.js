import prisma from './src/config/database.js'
const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true } })
console.log(JSON.stringify(users, null, 2))
await prisma.$disconnect()

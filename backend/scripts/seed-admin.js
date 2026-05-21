// Script para listar y crear usuario admin
// Ejecutar desde: backend/
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ── Credenciales admin ─────────────────────────────────────────────────────
//  Modifica aqui para añadir usuarios pre-configurados
const ADMIN_USERS = [
    {
        email: 'admin@butcheryorders.com',
        password: 'admin123',
        name: 'Administrador',
        role: 'ADMIN'
    }
]

async function main() {
    console.log('\n📋 Usuarios existentes en la DB:')
    const existing = await prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true }
    })
    console.table(existing)

    console.log('\n🔐 Verificando / creando usuarios admin...')
    for (const u of ADMIN_USERS) {
        const found = await prisma.user.findUnique({ where: { email: u.email } })
        if (found) {
            // Update password hash in case it changed
            const hash = await bcrypt.hash(u.password, 10)
            await prisma.user.update({
                where: { email: u.email },
                data: { passwordHash: hash, role: u.role, name: u.name }
            })
            console.log(`  ✅ Actualizado: ${u.email} (rol: ${u.role})`)
        } else {
            const hash = await bcrypt.hash(u.password, 10)
            await prisma.user.create({
                data: { email: u.email, passwordHash: hash, name: u.name, role: u.role }
            })
            console.log(`  ✅ Creado: ${u.email} (rol: ${u.role})`)
        }
    }

    console.log('\n📋 Usuarios después del seed:')
    const after = await prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true }
    })
    console.table(after)
}

main()
    .catch(e => { console.error('❌', e.message); process.exit(1) })
    .finally(() => prisma.$disconnect())

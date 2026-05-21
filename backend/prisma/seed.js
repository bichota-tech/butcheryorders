import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@butcheryorders.com' },
        update: {
            passwordHash: adminPassword,
            name: 'Administrador',
            role: 'ADMIN'
        },
        create: {
            email: 'admin@butcheryorders.com',
            passwordHash: adminPassword,
            name: 'Administrador',
            role: 'ADMIN'
        }
    })
    console.log('✅ Created admin user:', admin.email)

    // Create test user
    const testPassword = await bcrypt.hash('test123', 10)
    const testUser = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            email: 'test@example.com',
            passwordHash: testPassword,
            name: 'Test User',
            role: 'USER'
        }
    })
    console.log('✅ Created test user:', testUser.email)

    // Create specific products
    const products = [
        { name: 'Ternera', category: 'Carnes', unit: 'kg', pricePerUnit: 14.50 },
        { name: 'Cachopos', category: 'Prepared', unit: 'units', pricePerUnit: 12.00 },
        { name: 'Lechazo', category: 'Carnes', unit: 'kg', pricePerUnit: 18.00 },
        { name: 'Cerdo Ibérico', category: 'Carnes', unit: 'kg', pricePerUnit: 16.50 },
        { name: 'Callos', category: 'Carnes', unit: 'kg', pricePerUnit: 8.50 },
        { name: 'Croquetas de Jamón', category: 'Prepared', unit: 'units', pricePerUnit: 0.80 },
        { name: 'Legumbre', category: 'Pantry', unit: 'kg', pricePerUnit: 4.50 },
        { name: 'Hamburguesas', category: 'Prepared', unit: 'units', pricePerUnit: 1.50 },
        { name: 'Salchichas Rojas', category: 'Embutidos', unit: 'kg', pricePerUnit: 7.50 },
        { name: 'Salchichas Blancas', category: 'Embutidos', unit: 'kg', pricePerUnit: 7.50 },
        { name: 'Rollos de Ternera', category: 'Prepared', unit: 'kg', pricePerUnit: 15.00 },
        { name: 'Rollos de Cerdo', category: 'Prepared', unit: 'kg', pricePerUnit: 12.00 },
        { name: 'Rollos de Pollo', category: 'Prepared', unit: 'kg', pricePerUnit: 11.00 },
        { name: 'Pollo Relleno', category: 'Prepared', unit: 'kg', pricePerUnit: 10.50 },
        { name: 'Jamón Ibérico', category: 'Embutidos', unit: 'kg', pricePerUnit: 0 },
        { name: 'Jamón Serrano', category: 'Embutidos', unit: 'kg', pricePerUnit: 0 }
    ]

    for (const product of products) {
        await prisma.product.upsert({
            where: {
                id: product.name.toLowerCase().replace(/\s+/g, '-')
            },
            update: {},
            create: {
                id: product.name.toLowerCase().replace(/\s+/g, '-'),
                ...product
            }
        })
    }
    console.log(`✅ Created ${products.length} products`)

    // Create sample order for test user
    const sampleOrder = await prisma.order.create({
        data: {
            userId: testUser.id,
            status: 'COMPLETED',
            totalAmount: 45.00,
            transcript: '2 kilos de carne roja y 1 kilo de pollo',
            items: {
                create: [
                    {
                        productId: 'ternera',
                        quantity: 2,
                        unit: 'kg',
                        priceAtTime: 14.50
                    },
                    {
                        productId: 'salchichas-rojas',
                        quantity: 1,
                        unit: 'kg',
                        priceAtTime: 7.50
                    }
                ]
            }
        }
    })
    console.log('✅ Created sample order:', sampleOrder.id)

    console.log('🎉 Database seed completed!')
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔧 Applying product fixes...')

    // Issue #6: Delete "Pavo" product (soft-delete by marking inactive, or hard delete if no orders reference it)
    try {
        const pavoOrders = await prisma.orderItem.findMany({
            where: { product: { name: 'Pavo' } }
        })

        if (pavoOrders.length > 0) {
            // Soft delete - mark as inactive if there are orders
            await prisma.product.updateMany({
                where: { name: 'Pavo' },
                data: { isActive: false }
            })
            console.log('✅ Soft-deleted "Pavo" (has existing orders)')
        } else {
            await prisma.product.deleteMany({
                where: { name: 'Pavo' }
            })
            console.log('✅ Deleted "Pavo" product')
        }
    } catch (e) {
        console.log('⚠️  "Pavo" not found or already deleted:', e.message)
    }

    // Issue #7: Rename "Jamón" → "Jamón Ibérico"
    try {
        await prisma.product.updateMany({
            where: { name: 'Jamón' },
            data: { name: 'Jamón Ibérico' }
        })
        console.log('✅ Renamed "Jamón" → "Jamón Ibérico"')
    } catch (e) {
        console.log('⚠️  Could not rename "Jamón":', e.message)
    }

    // Issue #8: Add "Jamón Serrano" product
    try {
        await prisma.product.upsert({
            where: { id: 'jamón-serrano' },
            update: {},
            create: {
                id: 'jamón-serrano',
                name: 'Jamón Serrano',
                category: 'Embutidos',
                unit: 'kg',
                pricePerUnit: 0
            }
        })
        console.log('✅ Added "Jamón Serrano" product')
    } catch (e) {
        console.log('⚠️  Could not add "Jamón Serrano":', e.message)
    }

    console.log('🎉 Product fixes applied!')
}

main()
    .catch((e) => {
        console.error('❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

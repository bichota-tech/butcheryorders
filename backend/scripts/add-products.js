/**
 * Script to add new products to the butchery database.
 * Run: node scripts/add-products.js (from backend dir)
 */
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const newProducts = [
    // ── Beef Fillets ─────────────────────────────────────────────────────────
    { id: 'filetes-de-solomillo', name: 'Filetes de Solomillo', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'filetes-de-lomo-alto', name: 'Filetes de Lomo Alto', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'filetes-de-lomo-bajo', name: 'Filetes de Lomo Bajo', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'filetes-de-babilla', name: 'Filetes de Babilla', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'filetes-de-cadera', name: 'Filetes de Cadera', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'filetes-de-tapa', name: 'Filetes de Tapa', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'filetes-de-redondo', name: 'Filetes de Redondo', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'filetes-de-contra', name: 'Filetes de Contra', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'filetes', name: 'Filetes', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    // ── Other beef cuts ─────────────────────────────────────────────────────
    { id: 'solomillo', name: 'Solomillo', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'redondo', name: 'Redondo', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'chuleton', name: 'Chuletón', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'carne-picada', name: 'Carne Picada', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'rabo', name: 'Rabo', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'higado-de-ternera', name: 'Hígado de Ternera', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'rosbif', name: 'Rosbif', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    // ── Poultry ─────────────────────────────────────────────────────────────
    { id: 'pollo-entero', name: 'Pollo Entero', category: 'Aves', unit: 'units', pricePerUnit: 0 },
    // ── Pork & Charcuterie ──────────────────────────────────────────────────
    { id: 'compango', name: 'Compango', category: 'Cerdo', unit: 'units', pricePerUnit: 0 },
    { id: 'picadillo', name: 'Picadillo', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },
    { id: 'chorizo', name: 'Chorizo', category: 'Embutidos', unit: 'kg', pricePerUnit: 0 },
    // ── Preparados ───────────────────────────────────────────────────────────
    { id: 'jamon-iberico', name: 'Jamón Ibérico', category: 'Embutidos', unit: 'kg', pricePerUnit: 0 },
    { id: 'caldo', name: 'Caldo', category: 'Preparados', unit: 'units', pricePerUnit: 0 },
    { id: 'cocido', name: 'Cocido', category: 'Preparados', unit: 'units', pricePerUnit: 0 },
]

async function main() {
    console.log('🌱 Adding new products...')
    let added = 0, skipped = 0

    for (const p of newProducts) {
        const existing = await prisma.product.findUnique({ where: { id: p.id } })
        if (existing) {
            console.log(`  ⏭  Skipping (exists): ${p.name}`)
            skipped++
            continue
        }
        await prisma.product.create({ data: p })
        console.log(`  ✅ Added: ${p.name}`)
        added++
    }

    const total = await prisma.product.count()
    console.log(`\n🎉 Done. Added: ${added}, Skipped: ${skipped}. Total products in DB: ${total}`)
}

main()
    .catch(e => { console.error('❌', e); process.exit(1) })
    .finally(() => prisma.$disconnect())

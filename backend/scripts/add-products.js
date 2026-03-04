/**
 * Script to REPLACE all products in DB with the definitive catalog.
 * Run: node scripts/add-products.js (from backend dir)
 * Strategy: deleteMany all existing products, then insert all new ones.
 * WARNING: this will fail if products are referenced by ORDER ITEMS (FK constraint).
 *          Use upsert mode to safely update names/categories instead.
 */
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const catalog = [
    // ── 🥩 Ternera ──────────────────────────────────────────────────────────
    { id: 'chuleton-de-ternera', name: 'Chuletón de ternera', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'entrecot-de-ternera', name: 'Entrecot de ternera', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'solomillo-de-ternera', name: 'Solomillo de ternera', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'escalopines-de-ternera', name: 'Escalopines de ternera', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'carne-guisada-de-ternera', name: 'Carne guisada de ternera', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'hamburguesa-de-ternera', name: 'Hamburguesa de ternera', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'cecina-de-vacuno', name: 'Cecina de vacuno', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'carne-picada-de-ternera', name: 'Carne picada de ternera', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'rosbif', name: 'Rosbif', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'costilla-de-ternera', name: 'Costilla de ternera', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'filetes-de-ternera', name: 'Filetes de ternera', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'chorizos-de-ternera', name: 'Chorizos de ternera', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'rollo-de-ternera', name: 'Rollo de ternera', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'paletilla', name: 'Paletilla', category: 'Ternera', unit: 'units', pricePerUnit: 0 },
    { id: 'lechazo-entero', name: 'Lechazo entero', category: 'Ternera', unit: 'units', pricePerUnit: 0 },
    { id: 'medio-lechazo', name: 'Medio lechazo', category: 'Ternera', unit: 'units', pricePerUnit: 0 },
    { id: 'chuletinas-de-cordero', name: 'Chuletinas de cordero', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'higado-de-ternera', name: 'Hígado de ternera', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'filetes-de-tapa', name: 'Filetes de tapa', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'filetes-de-babilla', name: 'Filetes de babilla', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'filetes-de-contra', name: 'Filetes de contra', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'filetes-de-lomo-alto', name: 'Filetes de lomo alto', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'filetes-de-lomo-bajo', name: 'Filetes de lomo bajo', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'filetes-de-redondo', name: 'Filetes de redondo', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'filetes-de-solomillo', name: 'Filetes de solomillo', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'filetes-de-corbata', name: 'Filetes de corbata', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'redondo', name: 'Redondo', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'corbata', name: 'Corbata', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },
    { id: 'chamon', name: 'Chamón', category: 'Ternera', unit: 'kg', pricePerUnit: 0 },

    // ── 🐖 Cerdo de Castaña ─────────────────────────────────────────────────
    { id: 'morcilla-asturiana', name: 'Morcilla asturiana', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },
    { id: 'lacon', name: 'Lacón', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },
    { id: 'costilla-de-cerdo', name: 'Costilla de cerdo', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },
    { id: 'panceta', name: 'Panceta', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },
    { id: 'tocino', name: 'Tocino', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },
    { id: 'lomo-embuchado', name: 'Lomo embuchado', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },
    { id: 'picadillo', name: 'Picadillo (adobo asturiano)', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },
    { id: 'chorizo-criollo', name: 'Chorizo criollo', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },
    { id: 'matachana', name: 'Matachana', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },
    { id: 'moscancia', name: 'Moscancia', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },
    { id: 'salchichon', name: 'Salchichón', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },
    { id: 'longaniza', name: 'Longaniza', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },
    { id: 'chorizo-de-pote', name: 'Chorizo de pote', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },
    { id: 'chorizo-iberico', name: 'Chorizo ibérico', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },
    { id: 'chorizo-cular', name: 'Chorizo cular', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },
    { id: 'salchichas-rojas', name: 'Salchichas rojas', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },
    { id: 'salchichas-blancas', name: 'Salchichas blancas', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },
    { id: 'carne-picada-de-cerdo', name: 'Carne picada de cerdo', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },
    { id: 'lomo-de-cerdo-adobado', name: 'Lomo de cerdo adobado', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },
    { id: 'lomo-de-cerdo', name: 'Lomo de cerdo', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },
    { id: 'rollo-de-cerdo', name: 'Rollo de cerdo', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },
    { id: 'manos-de-cerdo', name: 'Manos de cerdo', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },
    { id: 'jamon-york', name: 'Jamón York', category: 'Cerdo', unit: 'kg', pricePerUnit: 0 },

    // ── 🍗 Pollo ────────────────────────────────────────────────────────────
    { id: 'pollo-entero-deshuesado', name: 'Pollo entero deshuesado', category: 'Pollo', unit: 'units', pricePerUnit: 0 },
    { id: 'carne-picada-de-pollo', name: 'Carne picada de pollo', category: 'Pollo', unit: 'kg', pricePerUnit: 0 },
    { id: 'hamburguesas-de-pollo', name: 'Hamburguesas de pollo', category: 'Pollo', unit: 'kg', pricePerUnit: 0 },
    { id: 'alitas-de-pollo', name: 'Alitas de pollo', category: 'Pollo', unit: 'kg', pricePerUnit: 0 },
    { id: 'pechuga-de-pollo', name: 'Pechuga de pollo', category: 'Pollo', unit: 'kg', pricePerUnit: 0 },
    { id: 'pollo-troceado', name: 'Pollo troceado', category: 'Pollo', unit: 'kg', pricePerUnit: 0 },
    { id: 'pechuga-en-filetes', name: 'Pechuga en filetes', category: 'Pollo', unit: 'kg', pricePerUnit: 0 },

    // ── 🔥 Mixtos ───────────────────────────────────────────────────────────
    { id: 'cachopo', name: 'Cachopo', category: 'Mixtos', unit: 'units', pricePerUnit: 0 },
    { id: 'albondigas-mixtas', name: 'Albóndigas mixtas', category: 'Mixtos', unit: 'kg', pricePerUnit: 0 },
    { id: 'callos-asturianos', name: 'Callos asturianos', category: 'Mixtos', unit: 'kg', pricePerUnit: 0 },
    { id: 'carne-picada-mixta', name: 'Carne picada mixta', category: 'Mixtos', unit: 'kg', pricePerUnit: 0 },
    { id: 'san-jacobo', name: 'San Jacobo', category: 'Mixtos', unit: 'units', pricePerUnit: 0 },
    { id: 'croquetas-de-jamon', name: 'Croquetas de jamón', category: 'Mixtos', unit: 'units', pricePerUnit: 0 },
    { id: 'compango', name: 'Compango para fabada', category: 'Mixtos', unit: 'personas', pricePerUnit: 0 },
    { id: 'cocido', name: 'Cocido o caldo', category: 'Mixtos', unit: 'units', pricePerUnit: 0 },
    { id: 'rollo-de-ternera-relleno', name: 'Rollo de ternera relleno', category: 'Mixtos', unit: 'kg', pricePerUnit: 0 },
    { id: 'rollo-de-cerdo-relleno', name: 'Rollo de cerdo relleno', category: 'Mixtos', unit: 'kg', pricePerUnit: 0 },
    { id: 'pollo-entero-relleno', name: 'Pollo entero relleno', category: 'Mixtos', unit: 'units', pricePerUnit: 0 },
    { id: 'muslo-de-pollo-relleno', name: 'Muslo de pollo relleno', category: 'Mixtos', unit: 'units', pricePerUnit: 0 },
    { id: 'conejo', name: 'Conejo', category: 'Mixtos', unit: 'units', pricePerUnit: 0 },
    { id: 'cachopo-de-cecina', name: 'Cachopo de cecina', category: 'Mixtos', unit: 'units', pricePerUnit: 0 },

    // ── 🧀 Quesos ───────────────────────────────────────────────────────────
    { id: 'queso-azul-cabrales', name: 'Queso azul Cabrales', category: 'Quesos', unit: 'kg', pricePerUnit: 0 },
    { id: 'queso-sandwich', name: 'Queso sándwich', category: 'Quesos', unit: 'kg', pricePerUnit: 0 },
    { id: 'queso-curado', name: 'Queso curado', category: 'Quesos', unit: 'kg', pricePerUnit: 0 },
]

async function main() {
    console.log('🌱 Replacing product catalog (upsert mode — safe for existing orders)...')

    let upserted = 0
    for (const p of catalog) {
        await prisma.product.upsert({
            where: { id: p.id },
            update: { name: p.name, category: p.category, unit: p.unit },
            create: p
        })
        console.log(`  ✅ Upserted: ${p.name}`)
        upserted++
    }

    const total = await prisma.product.count()
    console.log(`\n🎉 Done. Upserted ${upserted} products. Total in DB: ${total}`)
}

main()
    .catch(e => { console.error('❌', e); process.exit(1) })
    .finally(() => prisma.$disconnect())

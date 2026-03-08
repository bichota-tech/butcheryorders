import logger from '../utils/logger.js'
import { extractClientInfo, segmentTranscript } from '../utils/nlp.utils.js'
import prisma from '../config/database.js'

/**
 * Extract order intent and items from voice transcript
 * Uses pattern matching to identify products, quantities, and units
 */
export const extractOrderIntent = (transcript) => {
    const items = []
    const text = transcript.toLowerCase().trim()

    logger.info('Processing transcript', { transcript: text })

    // ── Isolate product list from client header ───────────────────────────────
    const segments_meta = segmentTranscript(transcript)
    let productText = segments_meta.productListText || text

    // ── Text normalization ────────────────────────────────────────────────────
    // 1. Add space between digit and unit letter (e.g. "500g" → "500 g", "2kg" → "2 kg")
    productText = productText.replace(/(\d+)(kg|gr?|g)(?=\s|de\s|$)/gi, '$1 $2')
    // 2. STT error corrections (common speech-to-text mistakes)
    const STT_CORRECTIONS = [
        [/\bcon\s+pango\b/gi, 'compango'],
        [/\bpon\s+pango\b/gi, 'compango'],
        [/\bcon\s+pan\s+go\b/gi, 'compango'],
        [/\bcompan\s+go\b/gi, 'compango'],
        [/\bcom\s+pango\b/gi, 'compango'],
        // "con Pango de fabada" / "con Pango de pote" variants
        [/\bcon\s+pango\s+de\b/gi, 'compango de'],
        [/\bcompago\b/gi, 'compango'],
    ]
    for (const [pattern, fix] of STT_CORRECTIONS) productText = productText.replace(pattern, fix)

    // Split product list by:
    // 1. "y" or ","
    // 2. New product boundary: digit OR word-quantity followed by a unit keyword OR followed by a non-unit word
    //    e.g. "...ternera 300 gr..."   → split before "300 gr"
    //    e.g. "...tiernos medio kilo..." → split before "medio kilo"
    //    e.g. "...ternera tres cachopos..." → split before "tres cachopos"
    const UNITS = '(?:kilos?|kg|gramos?|grs?\\b|g\\b|unidades?|docenas?)'
    const WORD_QTYS = '(?:medio|media|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)'

    // Look-ahead for either a quantity+unit or a quantity+word
    const PRODUCT_BOUNDARY = new RegExp(
        `\\s+(?=(?:\\d+(?:[.,]\\d+)?|${WORD_QTYS})\\s+(?:${UNITS}|[a-záéíóúñ]+))`,
        'i'
    )
    const segments = productText.split(/\s+y\s+|,\s*/).flatMap(seg =>
        seg.split(PRODUCT_BOUNDARY)
    ).map(s => s.trim()).filter(Boolean)

    // Command patterns (check on full text, not segments)
    const commandPatterns = [
        {
            regex: /ver\s+pedidos\s+de\s+(hoy|ayer|esta\s+semana)/i,
            extract: (match) => ({ command: 'filter_date', value: match[1].toLowerCase() })
        },
        {
            regex: /filtrar\s+por\s+(?:producto\s+)?([a-záéíóúñ\s]+)/i,
            extract: (match) => ({ command: 'filter_product', value: match[1].trim() })
        },
        {
            regex: /exportar\s+(?:a\s+)?excel/i,
            extract: () => ({ command: 'export_excel' })
        }
    ]

    // Check for commands first on the full text
    for (const pattern of commandPatterns) {
        const match = pattern.regex.exec(text)
        if (match) {
            const item = pattern.extract(match)
            items.push(item)
        }
    }

    // If we found commands, return early
    const commands = items.filter(i => i.command)
    if (commands.length > 0) {
        logger.info('Intent extraction complete', { intent: 'command', commandCount: commands.length })
        return {
            intent: 'command',
            items: [],
            commands,
            confidence: 0.8,
            originalTranscript: transcript
        }
    }

    // Quantity word map (shared)
    const quantityMap = {
        medio: 0.5,
        media: 0.5,
        un: 1,
        una: 1,
        dos: 2,
        tres: 3,
        cuatro: 4,
        cinco: 5,
        seis: 6,
        siete: 7,
        ocho: 8,
        nueve: 9,
        diez: 10
    }

    const wordQuantities = Object.keys(quantityMap).join('|')

    // Product patterns - applied to each segment independently
    const productPatterns = [
        {
            // "media docena de huevos", "una docena de chorizos"
            regex: /(media|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+docenas?\s+(?:de\s+)?([a-záéíóúñ\s]+)/i,
            extract: (match) => {
                const word = match[1].toLowerCase()
                let multiplier = 12
                let baseQuantity = quantityMap[word] || 1
                if (word === 'media') {
                    baseQuantity = 0.5
                }
                return {
                    quantity: baseQuantity * multiplier,
                    unit: 'units',
                    product: match[2].trim()
                }
            }
        },
        {
            // Special: compango de fabada/pote para X personas
            // Voice: "compango de fabada para cuatro personas", "compango de pote para 6 personas"
            regex: /^compango\s+(?:de\s+(?:fabada|pote|cocido)\s+)?(?:asturiano\s+)?(?:para\s+(\d+|medio|media|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+personas?)?(?:.*)?$/i,
            extract: (match) => ({
                quantity: match[1] ? (quantityMap[match[1].toLowerCase()] ?? parseInt(match[1])) || 1 : 1,
                unit: 'personas',
                product: 'compango'
            })
        },
        {
            // Special: "para X caldo" / "para X cocido" / "para X cocido asturiano"
            // Voice pattern: "para cuatro caldo", "para dos cocido"
            regex: /^para\s+(\d+|medio|media|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+(caldo|cocido|cocido\s+asturiano)(?:\s+.*)?$/i,
            extract: (match) => ({
                quantity: (quantityMap[match[1].toLowerCase()] ?? parseInt(match[1])) || 1,
                unit: 'units',
                product: match[2].toLowerCase().startsWith('cocido') ? 'cocido' : 'caldo'
            })
        },
        {
            // "2 kilos de carne roja", "3 kg de pollo", "1,5 kilos de ternera"
            regex: /(\d+(?:[.,]\d+)?)\s*(kilos?|kg)\s+(?:de\s+)?([a-záéíóúñ\s]+)/i,
            extract: (match) => ({
                quantity: parseFloat(match[1].replace(',', '.')),
                unit: 'kg',
                product: match[3].trim()
            })
        },
        {
            // "500 gramos de carne picada", "250g de lomo"
            regex: /(\d+(?:[.,]\d+)?)\s*(gramos?|gr?)\s+(?:de\s+)?([a-záéíóúñ\s]+)/i,
            extract: (match) => ({
                quantity: parseFloat(match[1].replace(',', '.')) / 1000, // convert to kg
                unit: 'kg',
                product: match[3].trim()
            })
        },
        {
            // "5 unidades de chorizo", "2 unidades de salchichas"
            regex: /(\d+)\s*(unidades?|units?)\s+(?:de\s+)?([a-záéíóúñ\s]+)/i,
            extract: (match) => ({
                quantity: parseInt(match[1]),
                unit: 'units',
                product: match[3].trim()
            })
        },
        {
            // "1 cachopo grande", "2 entrecots" — bare digit + product name (no unit keyword)
            regex: /(\d+)\s+(?!kilos?|kg|gramos?|gr?|unidades?|units?|de\s)([a-záéíóúñ][a-záéíóúñ\s]+)/i,
            extract: (match) => ({
                quantity: parseInt(match[1]),
                unit: 'units',
                product: match[2].trim()
            })
        },
        {
            // "medio kilo de jamón", "un kilo de cerdo", "tres kilos de ternera"
            regex: new RegExp(`(${wordQuantities})\\s+(kilos?|kg)\\s+(?:de\\s+)?([a-záéíóúñ\\s]+)`, 'i'),
            extract: (match) => ({
                quantity: quantityMap[match[1].toLowerCase()] || 1,
                unit: 'kg',
                product: match[3].trim()
            })
        },
        {
            // "quinientos gramos de...", "doscientos cincuenta gramos"
            regex: new RegExp(`(${wordQuantities})\\s+(gramos?|gr?)\\s+(?:de\\s+)?([a-záéíóúñ\\s]+)`, 'i'),
            extract: (match) => ({
                quantity: (quantityMap[match[1].toLowerCase()] || 1) / 1000,
                unit: 'kg',
                product: match[3].trim()
            })
        },
        {
            // "tres unidades de chorizo", "una unidad de hamburguesa", "dos unidades de croquetas"
            regex: new RegExp(`(${wordQuantities})\\s+(unidades?|units?)\\s+(?:de\\s+)?([a-záéíóúñ\\s]+)`, 'i'),
            extract: (match) => ({
                quantity: quantityMap[match[1].toLowerCase()] || 1,
                unit: 'units',
                product: match[3].trim()
            })
        },
        {
            // "tres unidades de chorizo", etc. are above; this catches bare: "un cachopo", "una pechuga"
            regex: new RegExp(`(${wordQuantities})\\s+(?!kilos?|kg|gramos?|gr?|unidades?|units?|de\\s)([a-z\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1][a-z\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1\\s]+)`, 'i'),
            extract: (match) => ({
                quantity: quantityMap[match[1].toLowerCase()] || 1,
                unit: 'units',
                product: match[2].trim()
            })
        },
        {
            // Fallback: bare product name with implicit quantity of 1
            // Catches: "compango de fabada", "chorizo extra" etc.
            // Only matched if no other pattern already matched the segment.
            regex: /^([a-z\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1][a-z\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1\s]+?)(?:\s+para\s+.*)?$/i,
            extract: (match) => ({
                quantity: 1,
                unit: 'units',
                product: match[1].trim()
            }),
            isFallback: true
        }
    ]

    // Process each segment independently
    for (const segment of segments) {
        let matched = false
        for (const pattern of productPatterns) {
            const match = pattern.regex.exec(segment)
            if (match) {
                try {
                    const item = pattern.extract(match)
                    if (item.product && item.quantity > 0) {
                        // Skip fallback patterns if a non-fallback already matched
                        if (pattern.isFallback && items.some(i => i.transcripcionOriginal === segment)) {
                            break
                        }
                        item.transcripcionOriginal = segment
                        items.push(item)
                        logger.debug('Extracted item', item)
                        matched = true
                        break // One match per segment is enough
                    }
                } catch (error) {
                    logger.warn('Failed to extract item from match', { match, error: error.message })
                }
            }
        }
        if (!matched) {
            logger.debug('No pattern matched for segment', { segment })
        }
    }

    const orderItems = items.filter(i => !i.command)

    const intent = orderItems.length > 0 ? 'create_order' : 'unknown'
    const confidence = orderItems.length > 0 ? 0.8 : 0.3

    logger.info('Intent extraction complete', { intent, itemCount: orderItems.length, confidence })

    // Extract client info (Name, Phone, Date)
    const clientData = extractClientInfo(transcript)
    if (clientData.clientName || clientData.clientPhone || clientData.pickupDate) {
        logger.info('Extracted client data', clientData)
    }

    return {
        intent,
        items: orderItems,
        commands: [],
        confidence,
        originalTranscript: transcript,
        clientData
    }
}

/**
 * Match extracted product names to actual product IDs in database
 */
export const matchProductNames = async (extractedItems, products) => {
    const matchedItems = []

    // 1. Sort products by name length descending to match longest possible name first
    // "filetes de ternera" should match before "ternera"
    const sortedProducts = [...products].sort((a, b) => b.name.length - a.name.length)

    let lastMatchedProduct = null

    for (const item of extractedItems) {
        let productName = item.product.toLowerCase()
        let matchedProduct = null
        let notes = ''

        // 0. Check for context reference ("otra", "otro")
        // "una pechuga en filetes y otra en trozos"
        if (lastMatchedProduct && (productName.startsWith('otr') || productName.startsWith('y otr'))) {
            matchedProduct = lastMatchedProduct
            // Remove "otra" text to get notes
            // "otra en trozos" -> "en trozos"
            notes = productName.replace(/^(?:y\s+)?otr[ao]s?\s+/, '').trim()
        } else {
            // Try to find a product name that matches the start of the extracted text
            // Plural/singular normalization: "filetes" ↔ "filete"
            const stem = (s) => s.split(' ').map(w => w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w).join(' ')
            const productStem = stem(productName)

            for (const p of sortedProducts) {
                const pName = p.name.toLowerCase()
                const pStem = stem(pName)

                // Check if extracted text starts with product name (allowing plural variation)
                if (productName === pName || productName.startsWith(pName + ' ') ||
                    productStem === pStem || productStem.startsWith(pStem + ' ')) {
                    matchedProduct = p
                    // specificities are what remains after the product prefix
                    const prefixLen = productStem.startsWith(pStem + ' ') ? pName.length : pName.length
                    notes = productName.slice(prefixLen).trim()
                    if (notes.startsWith('de ')) notes = notes.slice(3).trim()
                    if (notes.startsWith(',')) notes = notes.slice(1).trim()
                    break
                }
            }
        }

        if (!matchedProduct) {
            // Fallback 1: inclusion — extracted text contains catalog name (e.g. "carne picada mixta" ⊇ "carne picada")
            matchedProduct = sortedProducts.find(p => productName.includes(p.name.toLowerCase()))
            if (matchedProduct) {
                notes = productName.replace(matchedProduct.name.toLowerCase(), '').trim()
            }
        }

        if (!matchedProduct) {
            // Fallback 2: reverse-contains — catalog name contains extracted word
            // e.g. "jamón" → "Jamón Ibérico" (first/longest match)
            matchedProduct = sortedProducts.find(p => p.name.toLowerCase().includes(productName))
            if (matchedProduct) {
                notes = '' // product name is a subset; no leftover specifics
            }
        }

        if (matchedProduct) {
            lastMatchedProduct = matchedProduct // Update context
            matchedItems.push({
                productId: matchedProduct.id,
                productName: matchedProduct.name,
                quantity: item.quantity,
                unit: item.unit,
                notes: notes || null,
                transcripcionOriginal: item.transcripcionOriginal || null,
                confidence: 0.9
            })
            logger.debug('Matched product', {
                extracted: item.product,
                matched: matchedProduct.name,
                notes: notes
            })
        } else {
            logger.warn('No product match found, creating dynamically', { product: item.product })
            try {
                const formattedName = item.product.charAt(0).toUpperCase() + item.product.slice(1).toLowerCase()
                const newProduct = await prisma.product.create({
                    data: {
                        name: formattedName,
                        category: 'Otros',
                        unit: item.unit,
                        pricePerUnit: 0,
                        isActive: true
                    }
                })

                sortedProducts.push(newProduct)
                sortedProducts.sort((a, b) => b.name.length - a.name.length)

                matchedItems.push({
                    productId: newProduct.id,
                    productName: newProduct.name,
                    quantity: item.quantity,
                    unit: item.unit,
                    notes: null,
                    transcripcionOriginal: item.transcripcionOriginal || null,
                    confidence: 0.5,
                    needsManualReview: true
                })
                logger.info('Dynamically created product', { id: newProduct.id, name: newProduct.name })
            } catch (error) {
                logger.error('Failed to create dynamic product', { error: error.message })
                matchedItems.push({
                    productId: null,
                    productName: item.product,
                    quantity: item.quantity,
                    unit: item.unit,
                    notes: null,
                    transcripcionOriginal: item.transcripcionOriginal || null,
                    confidence: 0.3,
                    needsManualReview: true
                })
            }
        }
    }

    return matchedItems
}

/**
 * Validate that extracted items are valid for order creation
 */
export const validateOrderItems = (items) => {
    const errors = []

    if (items.length === 0) {
        errors.push('No items found in transcript')
    }

    items.forEach((item, index) => {
        if (!item.productId) {
            errors.push(`Item ${index + 1}: Product "${item.productName}" not recognized`)
        }
        if (item.quantity <= 0) {
            errors.push(`Item ${index + 1}: Invalid quantity ${item.quantity}`)
        }
        if (!['kg', 'units'].includes(item.unit)) {
            errors.push(`Item ${index + 1}: Invalid unit ${item.unit}`)
        }
    })

    return {
        isValid: errors.length === 0,
        errors
    }
}

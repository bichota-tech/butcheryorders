import logger from '../utils/logger.js'
import { extractClientInfo, segmentTranscript } from '../utils/nlp.utils.js'

/**
 * Extract order intent and items from voice transcript
 * Uses pattern matching to identify products, quantities, and units
 */
export const extractOrderIntent = (transcript) => {
    const items = []
    const text = transcript.toLowerCase().trim()

    logger.info('Processing transcript', { transcript: text })

    // ── Isolate product list from client header ───────────────────────────────
    // Use segmentTranscript to find where the product list starts.
    // If no structured header is detected, treat the whole text as product list.
    const segments_meta = segmentTranscript(transcript)
    const productText = segments_meta.productListText || text

    // Split product list by:
    // 1. "y" or ","
    // 2. New product boundary: digit OR word-quantity followed by a unit keyword
    //    e.g. "...ternera 300 gr..."   → split before "300 gr"
    //    e.g. "...tiernos medio kilo..." → split before "medio kilo"
    const UNITS = '(?:kilos?|kg|gramos?|grs?\\b|g\\b|unidades?)'
    const WORD_QTYS = '(?:medio|media|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)'
    const PRODUCT_BOUNDARY = new RegExp(
        `\\s+(?=(?:\\d+(?:[.,]\\d+)?|${WORD_QTYS})\\s+${UNITS})`,
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
            // "un cachopo", "una pechuga" — word quantity + bare product name
            regex: new RegExp(`(${wordQuantities})\\s+(?!kilos?|kg|gramos?|gr?|unidades?|units?|de\\s)([a-záéíóúñ][a-záéíóúñ\\s]+)`, 'i'),
            extract: (match) => ({
                quantity: quantityMap[match[1].toLowerCase()] || 1,
                unit: 'units',
                product: match[2].trim()
            })
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
                        // Preserve the original spoken segment text for transcripcionOriginal
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
            for (const p of sortedProducts) {
                const pName = p.name.toLowerCase()

                // Check if extracted text starts with product name
                // Allow for plural variations or exact match
                if (productName === pName || productName.startsWith(pName + ' ')) {
                    matchedProduct = p
                    // specificities are what remains
                    notes = productName.slice(pName.length).trim()
                    // cleanup notes (remove leading 'de', etc if needed)
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
            logger.warn('No product match found', { product: item.product })
            matchedItems.push({
                productId: null,
                productName: item.product,
                quantity: item.quantity,
                unit: item.unit,
                notes: null,
                confidence: 0.3,
                needsManualReview: true
            })
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

import logger from '../utils/logger.js'

/**
 * Extract order intent and items from voice transcript
 * Uses pattern matching to identify products, quantities, and units
 */
export const extractOrderIntent = (transcript) => {
    const items = []
    const text = transcript.toLowerCase().trim()

    logger.info('Processing transcript', { transcript: text })

    // Split by "y" or "," to handle multiple items
    const segments = text.split(/\s+y\s+|,\s*/).map(s => s.trim()).filter(Boolean)

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

    // Product patterns - applied to each segment independently
    const productPatterns = [
        {
            // "2 kilos de carne roja", "3 kg de pollo"
            regex: /(\d+(?:[.,]\d+)?)\s*(kilos?|kg)\s+(?:de\s+)?([a-záéíóúñ\s]+)/i,
            extract: (match) => ({
                quantity: parseFloat(match[1].replace(',', '.')),
                unit: 'kg',
                product: match[3].trim()
            })
        },
        {
            // "5 unidades de chorizo", "2 units de salchichas"
            regex: /(\d+)\s*(unidades?|units?)\s+(?:de\s+)?([a-záéíóúñ\s]+)/i,
            extract: (match) => ({
                quantity: parseInt(match[1]),
                unit: 'units',
                product: match[3].trim()
            })
        },
        {
            // "medio kilo de jamón", "un kilo de cerdo"
            regex: /(medio|un|una|dos|tres|cuatro|cinco)\s+(kilos?|kg)\s+(?:de\s+)?([a-záéíóúñ\s]+)/i,
            extract: (match) => {
                const quantityMap = {
                    medio: 0.5,
                    un: 1,
                    una: 1,
                    dos: 2,
                    tres: 3,
                    cuatro: 4,
                    cinco: 5
                }
                return {
                    quantity: quantityMap[match[1]] || 1,
                    unit: 'kg',
                    product: match[3].trim()
                }
            }
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

    return {
        intent,
        items: orderItems,
        commands: [],
        confidence,
        originalTranscript: transcript
    }
}

/**
 * Match extracted product names to actual product IDs in database
 */
export const matchProductNames = async (extractedItems, products) => {
    const matchedItems = []

    for (const item of extractedItems) {
        const productName = item.product.toLowerCase()

        // Find best match in product catalog
        const match = products.find((p) => {
            const pName = p.name.toLowerCase()
            return (
                pName === productName ||
                pName.includes(productName) ||
                productName.includes(pName) ||
                // Handle common variations
                (productName.includes('carne') && pName.includes('carne')) ||
                (productName.includes('pollo') && pName.includes('pollo')) ||
                (productName.includes('cerdo') && pName.includes('cerdo'))
            )
        })

        if (match) {
            matchedItems.push({
                productId: match.id,
                productName: match.name,
                quantity: item.quantity,
                unit: item.unit,
                confidence: 0.9
            })
            logger.debug('Matched product', { extracted: item.product, matched: match.name })
        } else {
            logger.warn('No product match found', { product: item.product })
            matchedItems.push({
                productId: null,
                productName: item.product,
                quantity: item.quantity,
                unit: item.unit,
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

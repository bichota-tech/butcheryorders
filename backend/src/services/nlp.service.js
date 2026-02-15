import logger from '../utils/logger.js'

/**
 * Extract order intent and items from voice transcript
 * Uses pattern matching to identify products, quantities, and units
 */
export const extractOrderIntent = (transcript) => {
    const items = []
    const text = transcript.toLowerCase().trim()

    logger.info('Processing transcript', { transcript: text })

    // Pattern matching for common Spanish phrases
    const patterns = [
        // COMMANDS
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
        },
        // PRODUCT PATTERNS
        {
            // "2 kilos de carne roja", "3 kg de pollo"
            regex: /(\d+(?:[.,]\d+)?)\s*(kilos?|kg)\s+(?:de\s+)?([a-záéíóúñ\s]+?)(?=\s+y\s+|\s*$|,)/gi,
            extract: (match) => ({
                quantity: parseFloat(match[1].replace(',', '.')),
                unit: 'kg',
                product: match[3].trim()
            })
        },
        {
            // "5 unidades de chorizo", "2 units de salchichas"
            regex: /(\d+)\s*(unidades?|units?)\s+(?:de\s+)?([a-záéíóúñ\s]+?)(?=\s+y\s+|\s*$|,)/gi,
            extract: (match) => ({
                quantity: parseInt(match[1]),
                unit: 'units',
                product: match[3].trim()
            })
        },
        {
            // "medio kilo de jamón", "un kilo de cerdo"
            regex: /(medio|un|una|dos|tres|cuatro|cinco)\s+(kilos?|kg)\s+(?:de\s+)?([a-záéíóúñ\s]+?)(?=\s+y\s+|\s*$|,)/gi,
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

    // Apply all patterns
    patterns.forEach((pattern) => {
        let match
        const regex = new RegExp(pattern.regex)
        while ((match = regex.exec(text)) !== null) {
            try {
                const item = pattern.extract(match)
                if (item.product && item.quantity > 0) {
                    items.push(item)
                    logger.debug('Extracted item', item)
                }
            } catch (error) {
                logger.warn('Failed to extract item from match', { match, error: error.message })
            }
        }
    })

    // Determine intent
    const commands = items.filter(i => i.command)
    const orderItems = items.filter(i => !i.command)

    let intent = 'unknown'
    if (commands.length > 0) {
        intent = 'command'
    } else if (orderItems.length > 0) {
        intent = 'create_order'
    }

    const confidence = (commands.length > 0 || orderItems.length > 0) ? 0.8 : 0.3

    logger.info('Intent extraction complete', { intent, commandCount: commands.length, itemCount: orderItems.length, confidence })

    return {
        intent,
        items: orderItems,
        commands,
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

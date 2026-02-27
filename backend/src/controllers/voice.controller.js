import * as nlpService from '../services/nlp.service.js'
import * as productsService from '../services/products.service.js'
import { successResponse } from '../utils/responses.js'
import logger from '../utils/logger.js'

export const processTranscript = async (req, res, next) => {
    try {
        const { transcript } = req.body

        if (!transcript) {
            const error = new Error('Transcript required')
            error.statusCode = 400
            throw error
        }

        logger.info('Processing voice transcript', { userId: req.user.id, transcript })

        // Extract intent and items from transcript
        const extraction = nlpService.extractOrderIntent(transcript)

        // Get all active products for matching
        const products = await productsService.getAllProducts(true)

        // Match extracted product names to actual products
        const matchedItems = await nlpService.matchProductNames(extraction.items, products)

        // Validate items
        const validation = nlpService.validateOrderItems(matchedItems)

        const response = {
            intent: extraction.intent,
            confidence: extraction.confidence,
            items: matchedItems,
            validation,
            clientData: extraction.clientData || {},
            originalTranscript: transcript
        }

        res.json(successResponse(response, 'Transcript processed'))
    } catch (error) {
        next(error)
    }
}

import Joi from 'joi'

export const registerSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required'
    }),
    name: Joi.string().min(2).required().messages({
        'string.min': 'Name must be at least 2 characters',
        'any.required': 'Name is required'
    })
})

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})

export const createOrderSchema = Joi.object({
    items: Joi.array()
        .items(
            Joi.object({
                productId: Joi.string().required(),
                quantity: Joi.number().positive().required(),
                unit: Joi.string().valid('kg', 'units').required()
            }).unknown(true)
        )
        .min(1)
        .required(),
    transcript: Joi.string().optional(),
    voiceRecordingUrl: Joi.string().uri().optional()
})

export const updateOrderSchema = Joi.object({
    status: Joi.string().valid('PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED')
})

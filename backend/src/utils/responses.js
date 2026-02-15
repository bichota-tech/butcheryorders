export const successResponse = (data, message = 'Success') => ({
    success: true,
    message,
    data
})

export const errorResponse = (message, errors = null) => ({
    success: false,
    message,
    ...(errors && { errors })
})

export const paginatedResponse = (data, page, limit, total) => ({
    success: true,
    data,
    pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
    }
})

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next()
    } else {
        res.status(403).json({
            status: 'error',
            message: 'Access denied. Admin role required.'
        })
    }
}

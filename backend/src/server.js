import 'dotenv/config'
import app from './app.js'
import logger from './utils/logger.js'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`)
    logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
    logger.info(`🔗 API available at http://localhost:${PORT}/api`)
})

import winston from 'winston'

const isProduction = process.env.NODE_ENV === 'production'
const level = process.env.LOG_LEVEL || (isProduction ? 'warn' : 'info')

const logger = winston.createLogger({
    level,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        isProduction
            ? winston.format.json()
            : winston.format.combine(winston.format.colorize(), winston.format.simple())
    ),
    defaultMeta: { service: 'butcheryorders-api' },
    transports: [
        new winston.transports.Console()
    ]
})

export default logger

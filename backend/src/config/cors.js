import cors from 'cors'

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true)

        const allowedOrigins = [process.env.CORS_ORIGIN, 'http://localhost:5173', 'http://localhost:5174']

        // Allow localhost on any port for development convenience
        if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}

export default cors(corsOptions)

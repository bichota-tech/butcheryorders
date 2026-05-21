import cors from 'cors'

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true)

        const allowedOrigins = [
            process.env.CORS_ORIGIN,
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3100',
            'http://localhost:3000'
        ]

        // Allow localhost on any port and firebase.com domains for development/production
        if (allowedOrigins.indexOf(origin) !== -1 || 
            origin.startsWith('http://localhost:') ||
            origin.includes('firebaseapp.com') ||
            origin.includes('web.app')) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}

export default cors(corsOptions)

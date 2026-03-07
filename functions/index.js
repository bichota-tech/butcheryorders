/**
 * Firebase Cloud Functions entry point
 * Wraps the Express app as a single HTTP function
 */
import { onRequest } from 'firebase-functions/v2/https'
import { setGlobalOptions } from 'firebase-functions/v2'

// Set region to Europe West (closer to Spain)
setGlobalOptions({ region: 'europe-west1', memory: '512MiB' })

// Dynamically import the Express app (loads env + prisma etc.)
// Using dynamic import so Firebase Functions can initialize before loading heavy deps
let appInstance = null

async function getApp() {
    if (!appInstance) {
        const { default: app } = await import('../backend/src/app.js')
        appInstance = app
    }
    return appInstance
}

export const api = onRequest(async (req, res) => {
    const app = await getApp()
    return app(req, res)
})

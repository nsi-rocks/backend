import { submissions } from '@@/server/database/schema'

export default defineEventHandler(async (event) => {
    try {
        const config = useRuntimeConfig()
        const body = await readBody(event)

        if (!body.password) {
            throw createError({
                statusCode: 400,
                message: 'Missing password',
            })
        }

        if (!config.adminPassword || body.password !== config.adminPassword) {
            throw createError({
                statusCode: 401,
                message: 'Invalid password',
            })
        }

        const db = useDb(event)

        const rows = await db.select().from(submissions)
        await db.delete(submissions)

        return rows
    } catch (error: any) {
        // Ensure CORS headers are set even on error
        const allowedOrigins = [
            'https://ia.nsi.rocks',
            'http://localhost:3000',
            'http://localhost:3001',
        ]
        const origin = getRequestHeader(event, 'origin')
        if (origin && allowedOrigins.includes(origin)) {
            setResponseHeader(event, 'Access-Control-Allow-Origin', origin)
            setResponseHeader(event, 'Access-Control-Allow-Credentials', 'true')
        }
        throw error
    }
})

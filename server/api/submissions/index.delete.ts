import { submissions } from '@@/server/database/schema'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const password = getRequestHeader(event, 'x-admin-password')

    if (!password) {
        throw createError({
            statusCode: 400,
            message: 'Missing password',
        })
    }

    if (!config.adminPassword || password !== config.adminPassword) {
        throw createError({
            statusCode: 401,
            message: 'Invalid password',
        })
    }

    const db = useDb(event)
    const rows = await db.delete(submissions).returning()

    return rows
})


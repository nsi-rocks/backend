import { submissions } from '@@/server/database/schema'

export default defineEventHandler(async (event) => {
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
})

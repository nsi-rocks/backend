import { submissions } from '@@/server/database/schema'

export default defineEventHandler(async (event) => {
    console.log('[DELETE /submissions] START')
    
    const config = useRuntimeConfig()
    console.log('[DELETE /submissions] Config loaded')
    
    // Try getting password from header instead of body
    const password = getRequestHeader(event, 'x-admin-password')
    console.log('[DELETE /submissions] Password from header:', !!password)

    if (!password) {
        console.log('[DELETE /submissions] ERROR: Missing password')
        throw createError({
            statusCode: 400,
            message: 'Missing password',
        })
    }

    if (!config.adminPassword || password !== config.adminPassword) {
        console.log('[DELETE /submissions] ERROR: Invalid password')
        throw createError({
            statusCode: 401,
            message: 'Invalid password',
        })
    }

    console.log('[DELETE /submissions] Auth OK, getting DB...')
    const db = useDb(event)
    console.log('[DELETE /submissions] DB retrieved, executing DELETE...')

    const rows = await db.delete(submissions).returning()
    console.log('[DELETE /submissions] DELETE completed, rows:', rows.length)

    return rows
})


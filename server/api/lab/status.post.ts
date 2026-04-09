import { setLabStatus } from '@@/server/utils/lab'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const body = await readBody(event)

    if (!body.password) {
        throw createError({ statusCode: 400, message: 'Missing password' })
    }

    if (!config.adminPassword || body.password !== config.adminPassword) {
        throw createError({ statusCode: 401, message: 'Invalid password' })
    }

    if (typeof body.open !== 'boolean') {
        throw createError({ statusCode: 400, message: 'Missing or invalid "open" field' })
    }

    await setLabStatus(event, body.open)
    return { open: body.open }
})

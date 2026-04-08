import { submissions } from '@@/server/database/schema'

export default defineEventHandler(async (event) => {
    const db = useDrizzle()
    const body = await readBody(event)

    // Validate required fields
    if (!body.studentName || !body.activityId || !body.prompt || !body.response) {
        throw createError({
            statusCode: 400,
            message: 'Missing required fields: studentName, activityId, prompt, response',
        })
    }

    // Insert submission
    const result = await db.insert(submissions).values({
        studentName: body.studentName,
        activityId: body.activityId,
        prompt: body.prompt,
        response: body.response,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
    }).returning()

    setResponseStatus(event, 201)
    return result[0]
})

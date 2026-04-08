import { eq, desc, and, like } from 'drizzle-orm'
import { submissions } from '@@/server/database/schema'

export default defineEventHandler(async (event) => {
    const db = useDrizzle()
    const query = getQuery(event)

    // Build filters
    const filters = []

    if (query.activityId) {
        filters.push(eq(submissions.activityId, query.activityId as string))
    }

    if (query.studentName) {
        filters.push(like(submissions.studentName, `%${query.studentName}%`))
    }

    // Query submissions with optional filters
    const results = await db
        .select()
        .from(submissions)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(desc(submissions.createdAt))
        .limit(query.limit ? Number(query.limit) : 100)

    return results
})

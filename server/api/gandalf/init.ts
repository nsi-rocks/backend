import { gandalfSessions } from '@@/server/database/schema'
import {
    createEmptyHistory,
    createSessionSecrets,
    GANDALF_MAX_ATTEMPTS_PER_LEVEL,
    GANDALF_MAX_LEVELS,
    getLevelIntro,
    getLevelLabel,
} from '@@/server/utils/gandalf'

export default defineEventHandler(async (event) => {
    const db = useDb(event)
    const body = await readBody(event)

    const labOpen = await getLabStatus(event)
    requireLabOpen(labOpen)

    if (!body.studentName || !body.activityId) {
        throw createError({
            statusCode: 400,
            message: 'Missing required fields: studentName, activityId',
        })
    }

    const result = await db.insert(gandalfSessions).values({
        studentName: body.studentName,
        activityId: body.activityId,
        currentLevel: 1,
        status: 'active',
        secrets: JSON.stringify(createSessionSecrets()),
        attemptCounts: JSON.stringify({ 1: 0, 2: 0, 3: 0, 4: 0 }),
        history: JSON.stringify(createEmptyHistory()),
        updatedAt: new Date(),
    }).returning()

    const session = result[0]

    if (!session) {
        throw createError({
            statusCode: 500,
            message: 'Failed to create Gandalf session',
        })
    }

    return {
        sessionId: session.publicId,
        currentLevel: 1,
        maxLevels: GANDALF_MAX_LEVELS,
        maxAttemptsPerLevel: GANDALF_MAX_ATTEMPTS_PER_LEVEL,
        levelLabel: getLevelLabel(1),
        introMessage: getLevelIntro(1),
        gameStatus: 'active',
    }
})
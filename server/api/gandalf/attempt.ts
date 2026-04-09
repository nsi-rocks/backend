import { eq } from 'drizzle-orm'
import { gandalfSessions } from '@@/server/database/schema'
import {
    analyzeInput,
    buildSystemPrompt,
    filterOutput,
    GANDALF_MAX_ATTEMPTS_PER_LEVEL,
    GANDALF_MAX_LEVELS,
    getLevelIntro,
    getLevelLabel,
    normalizeGuess,
    parseJsonObject,
    type GandalfHistory,
} from '@@/server/utils/gandalf'

type AttemptCounts = Record<number, number>

export default defineEventHandler(async (event) => {
    const db = useDb(event)
    const body = await readBody(event)

    const labOpen = await getLabStatus(event)
    requireLabOpen(labOpen)
    const config = useRuntimeConfig()

    if (!body.sessionId) {
        throw createError({
            statusCode: 400,
            message: 'Missing required field: sessionId',
        })
    }

    const sessions = await db
        .select()
        .from(gandalfSessions)
        .where(eq(gandalfSessions.publicId, body.sessionId))
        .limit(1)

    const session = sessions[0]

    if (!session) {
        throw createError({
            statusCode: 404,
            message: 'Gandalf session not found',
        })
    }

    if (session.status !== 'active') {
        return {
            sessionId: session.publicId,
            resolvedLevel: session.currentLevel,
            currentLevel: session.currentLevel,
            maxLevels: GANDALF_MAX_LEVELS,
            maxAttemptsPerLevel: GANDALF_MAX_ATTEMPTS_PER_LEVEL,
            attemptsUsed: parseJsonObject<AttemptCounts>(session.attemptCounts, { 1: 0, 2: 0, 3: 0, 4: 0 })[session.currentLevel] || 0,
            gameStatus: session.status,
            passwordCorrect: false,
            levelCompleted: false,
            challengeCompleted: session.status === 'completed',
            levelLabel: getLevelLabel(session.currentLevel),
            feedbackMessage: session.status === 'failed'
                ? 'Cette session est terminée. Relancez une nouvelle partie.'
                : 'Cette session est déjà terminée.',
        }
    }

    const currentLevel = session.currentLevel
    const secrets = parseJsonObject<string[]>(session.secrets, [])
    const attemptCounts = parseJsonObject<AttemptCounts>(session.attemptCounts, { 1: 0, 2: 0, 3: 0, 4: 0 })
    const history = parseJsonObject<GandalfHistory>(session.history, { 1: [], 2: [], 3: [], 4: [] })
    const secret = secrets[currentLevel - 1]
    const levelHistory = history[currentLevel] || []
    const message = typeof body.message === 'string' ? body.message.trim() : ''
    const passwordGuess = typeof body.passwordGuess === 'string' ? body.passwordGuess.trim() : ''

    if (!secret) {
        throw createError({
            statusCode: 500,
            message: 'Secret missing for current Gandalf level',
        })
    }

    history[currentLevel] = levelHistory

    if (!message && !passwordGuess) {
        throw createError({
            statusCode: 400,
            message: 'Provide either a message or a passwordGuess',
        })
    }

    attemptCounts[currentLevel] = (attemptCounts[currentLevel] || 0) + 1
    let guardianReply = ''
    let feedbackMessage = ''
    let passwordCorrect = false
    let levelCompleted = false
    let challengeCompleted = false
    let nextLevelIntro = ''
    let nextLevelLabel = ''
    let nextStatus: 'active' | 'failed' | 'completed' = 'active'
    let nextLevel = currentLevel

    if (message) {
        const analyzed = analyzeInput(currentLevel, message)

        levelHistory.push({ role: 'user', content: message })

        if (analyzed.blocked) {
            guardianReply = analyzed.reply || 'Je ne répondrai pas à cette demande.'
        } else {
            const messages = [
                { role: 'system', content: buildSystemPrompt(currentLevel, secret) },
                ...levelHistory.map(entry => ({
                    role: entry.role === 'assistant' ? 'assistant' : 'user',
                    content: entry.content,
                })),
            ]

            const mistralResponse = await $fetch<any>('https://api.mistral.ai/v1/chat/completions', {
                headers: {
                    Authorization: `Bearer ${config.mistralApiKey}`,
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: {
                    model: 'mistral-tiny',
                    messages,
                    temperature: 0.7,
                },
            })

            guardianReply = filterOutput(
                currentLevel,
                mistralResponse?.choices?.[0]?.message?.content || 'Je garde le silence.',
                secret,
            )
        }

        levelHistory.push({ role: 'assistant', content: guardianReply })
    }

    if (passwordGuess) {
        passwordCorrect = normalizeGuess(passwordGuess) === secret

        if (passwordCorrect) {
            levelCompleted = true
            feedbackMessage = 'Mot de passe correct. Niveau validé.'

            if (currentLevel >= GANDALF_MAX_LEVELS) {
                challengeCompleted = true
                nextStatus = 'completed'
            } else {
                nextLevel = currentLevel + 1
                nextLevelIntro = getLevelIntro(nextLevel)
                nextLevelLabel = getLevelLabel(nextLevel)
                feedbackMessage = `Mot de passe correct. ${nextLevelLabel} débloqué.`
            }
        } else {
            feedbackMessage = 'Mot de passe incorrect.'
        }
    }

    if (!passwordCorrect && attemptCounts[currentLevel] >= GANDALF_MAX_ATTEMPTS_PER_LEVEL) {
        nextStatus = 'failed'
        feedbackMessage = 'Limite de tentatives atteinte pour ce niveau. Recommencez une nouvelle partie.'
    }

    await db.update(gandalfSessions)
        .set({
            currentLevel: nextLevel,
            status: nextStatus,
            attemptCounts: JSON.stringify(attemptCounts),
            history: JSON.stringify(history),
            updatedAt: new Date(),
            completedAt: nextStatus === 'completed' || nextStatus === 'failed' ? new Date() : null,
        })
        .where(eq(gandalfSessions.id, session.id))

    return {
        sessionId: session.publicId,
        resolvedLevel: currentLevel,
        currentLevel: nextLevel,
        maxLevels: GANDALF_MAX_LEVELS,
        maxAttemptsPerLevel: GANDALF_MAX_ATTEMPTS_PER_LEVEL,
        attemptsUsed: passwordCorrect && nextLevel !== currentLevel ? 0 : attemptCounts[currentLevel],
        gameStatus: nextStatus,
        guardianReply,
        feedbackMessage,
        passwordCorrect,
        levelCompleted,
        challengeCompleted,
        levelLabel: getLevelLabel(currentLevel),
        nextLevelLabel,
        nextLevelIntro,
    }
})
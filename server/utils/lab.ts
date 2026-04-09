import { eq } from 'drizzle-orm'
import { settings } from '@@/server/database/schema'
import type { H3Event } from 'h3'

const LAB_KEY = 'lab_open'

export async function getLabStatus(event: H3Event): Promise<boolean> {
    const db = useDb(event)
    const rows = await db.select().from(settings).where(eq(settings.key, LAB_KEY))
    if (rows.length === 0) return true // default: open
    return rows[0]!.value === 'true'
}

export async function setLabStatus(event: H3Event, open: boolean): Promise<void> {
    const db = useDb(event)
    await db
        .insert(settings)
        .values({ key: LAB_KEY, value: open ? 'true' : 'false' })
        .onConflictDoUpdate({ target: settings.key, set: { value: open ? 'true' : 'false' } })
}

export function requireLabOpen(open: boolean) {
    if (!open) {
        throw createError({
            statusCode: 503,
            message: 'Le laboratoire est fermé.',
        })
    }
}

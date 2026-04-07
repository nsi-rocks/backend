// Rate limiting pour éviter les attaques par force brute sur les endpoints d'auth
import { tooManyRequests } from '../utils/httpErrors'

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

export default defineEventHandler(async (event) => {
    const path = event.path
    const method = getMethod(event)

    // Appliquer sur POST /api/auth/login et POST /api/auth/register
    const isLogin = method === 'POST' && path.includes('/api/auth/login')
    const isRegister = method === 'POST' && path.includes('/api/auth/register')
    if (!isLogin && !isRegister) return

    const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
    const now = Date.now()
    const windowMs = 15 * 60 * 1000 // 15 minutes
    const maxAttempts = 5

    const key = `${ip}:${isLogin ? 'login' : 'register'}`
    const entry = buckets.get(key)

    if (entry && now < entry.resetAt) {
        if (entry.count >= maxAttempts) {
            throw tooManyRequests()
        }
        entry.count++
    } else {
        buckets.set(key, { count: 1, resetAt: now + windowMs })
    }

    // Nettoyage périodique (très léger)
    if (Math.random() < 0.01) {
        for (const [k, v] of buckets.entries()) {
            if (now > v.resetAt) buckets.delete(k)
        }
    }
})

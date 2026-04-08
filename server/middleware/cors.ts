export default defineEventHandler((event) => {
    const allowedOrigins = [
        'https://ia.nsi.rocks',
        'http://localhost:3000',
        'http://localhost:3001',
    ]

    const origin = getRequestHeader(event, 'origin')

    // Check if origin is allowed
    if (origin && allowedOrigins.includes(origin)) {
        setResponseHeader(event, 'Access-Control-Allow-Origin', origin)
    }

    // Always set these headers
    setResponseHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    setResponseHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization')
    setResponseHeader(event, 'Access-Control-Allow-Credentials', 'true')
    setResponseHeader(event, 'Access-Control-Max-Age', 86400) // 24h cache

    // Handle preflight
    if (event.method === 'OPTIONS') {
        setResponseStatus(event, 204)
        return ''
    }
})

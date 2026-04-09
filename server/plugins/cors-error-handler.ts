export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, { event }) => {
    const allowedOrigins = [
      'https://ia.nsi.rocks',
      'http://localhost:3000',
      'http://localhost:3001',
    ]

    const origin = getRequestHeader(event, 'origin')

    // Always set CORS headers, even for errors
    if (origin && allowedOrigins.includes(origin)) {
      setResponseHeader(event, 'Access-Control-Allow-Origin', origin)
      setResponseHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      setResponseHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization')
      setResponseHeader(event, 'Access-Control-Allow-Credentials', 'true')
    }
  })
})

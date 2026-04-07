export default defineEventHandler(async (event) => {
    setResponseHeader(event, 'Content-Type', 'text/html')
    setResponseHeader(event, 'Cache-Control', 'no-cache')
    setResponseHeader(event, 'Transfer-Encoding', 'chunked')

    const body = await readBody(event)
    console.log('Body:', body)
    const config = useRuntimeConfig()

    const response = await $fetch('https://api.mistral.ai/v1/chat/completions', {
        headers: {
            'Authorization': `Bearer ${config.mistralApiKey}`,
            'Content-Type': 'application/json',
        },
        method: 'POST',
        responseType: 'stream',
        body: JSON.stringify({
            model: 'mistral-tiny',
            stream: true,
            messages: [{ role: 'user', content: body.query }],
        }),
    })

    return response
})

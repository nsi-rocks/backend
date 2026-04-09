export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const apiKey = config.mistralApiKey

    if (!apiKey) {
        throw createError({
            statusCode: 500,
            message: 'Mistral API key not configured',
        })
    }

    try {
        const response = await fetch('https://api.mistral.ai/v1/audio/voices', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw createError({
                statusCode: response.status,
                message: `Mistral API error: ${errorText}`,
            })
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Voices API Error:', error)
        throw createError({
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Unknown error',
        })
    }
})

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        input: string
        model?: string
        voiceId?: string
        responseFormat?: 'pcm' | 'wav' | 'mp3' | 'flac' | 'opus'
    }>(event)

    const config = useRuntimeConfig()
    const apiKey = config.mistralApiKey

    if (!apiKey) {
        throw createError({
            statusCode: 500,
            message: 'Mistral API key not configured',
        })
    }

    try {
        const response = await fetch('https://api.mistral.ai/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: body.model || 'voxtral-mini-tts-latest',
                input: body.input,
                voice_id: body.voiceId || undefined,
                response_format: body.responseFormat || 'wav',
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw createError({
                statusCode: response.status,
                message: `Mistral TTS API error: ${errorText}`,
            })
        }

        // Get content type to determine response format
        const contentType = response.headers.get('content-type')

        if (contentType?.includes('application/json')) {
            // Response is JSON with base64 encoded audio
            const jsonResponse = await response.json()

            // Extract base64 audio data
            const audioData = jsonResponse.audio_data || jsonResponse.data || jsonResponse.audio
            if (!audioData) {
                throw createError({
                    statusCode: 500,
                    message: 'No audio data in response',
                })
            }

            // Decode base64 to buffer
            const buffer = Buffer.from(audioData, 'base64')

            setHeader(event, 'Content-Type', `audio/${body.responseFormat || 'mp3'}`)
            return buffer
        } else {
            // Response is binary audio
            const audioBuffer = await response.arrayBuffer()
            const buffer = Buffer.from(audioBuffer)
            setHeader(event, 'Content-Type', `audio/${body.responseFormat || 'mp3'}`)
            return buffer
        }
    } catch (error) {
        console.error('TTS Error:', error)
        throw createError({
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Unknown error',
        })
    }
})

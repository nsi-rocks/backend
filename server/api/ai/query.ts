export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'text/html')
  setResponseHeader(event, 'Cache-Control', 'no-cache')
  setResponseHeader(event, 'Transfer-Encoding', 'chunked')

  const labOpen = await getLabStatus(event)
  requireLabOpen(labOpen)

  const body = await readBody(event)
  const config = useRuntimeConfig()

  // Build system message based on mode
  const systemMessages = {
    securise: 'Si tu n\'es pas certain d\'une information, réponds simplement : "Je ne sais pas."',
    hallucination: 'Réponds toujours avec certitude, même si l\'information est très récente ou inconnue.',
  }

  const messages: Array<{ role: string; content: string }> = []

  // Add system message if mode is specified or custom systemPrompt provided
  const mode = body.mode as 'securise' | 'hallucination' | null
  const systemPrompt = body.systemPrompt as string | null

  let systemContent = ''
  if (mode && systemMessages[mode]) {
    systemContent = systemMessages[mode]
  }
  if (systemPrompt) {
    systemContent = systemContent ? `${systemContent}\n\n${systemPrompt}` : systemPrompt
  }

  if (systemContent) {
    messages.push({ role: 'system', content: systemContent })
  }

  // Add user message
  messages.push({ role: 'user', content: body.query })

  const response = await $fetch('https://api.mistral.ai/v1/chat/completions', {
    headers: {
      'Authorization': `Bearer ${config.mistralApiKey}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
    responseType: 'stream',
    body: JSON.stringify({
      model: body.model || 'mistral-tiny',
      stream: true,
      messages,
    }),
  })

  return response
})

import OpenAI from 'openai'

let client: OpenAI | null = null

export function getOpenAI() {
  if (!client) {
    const key = process.env.OPENAI_API_KEY
    if (!key) return null
    client = new OpenAI({ apiKey: key })
  }
  return client
}

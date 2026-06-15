import Anthropic from '@anthropic-ai/sdk'

export async function POST(request) {
  const { message } = await request.json()

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json(
      { reply: 'Der AI-Mentor ist noch nicht konfiguriert. Bitte ANTHROPIC_API_KEY in den Vercel-Einstellungen setzen.' },
      { status: 200 }
    )
  }

  const anthropic = new Anthropic({ apiKey })

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 512,
    system: 'Du bist ein motivierender, freundlicher Mentor, der Nutzern hilft ihre Ziele zu erreichen. Antworte kurz und auf Deutsch.',
    messages: [{ role: 'user', content: message }],
  })

  const reply = response.content[0]?.text || 'Keine Antwort erhalten.'
  return Response.json({ reply })
}

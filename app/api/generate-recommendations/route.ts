import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { l2Results, processName } = await request.json()

    const scoresText = l2Results
      .map((r: { code: string; name: string; score: number; level: string }) => 
        `- ${r.code} ${r.name}: ${r.score}/5.0 (${r.level})`)
      .join('\n')

    const lowestScoring = [...l2Results]
      .sort((a: { score: number }, b: { score: number }) => a.score - b.score)
      .slice(0, 5)

    const prompt = `You are a Finance Process expert. Based on these maturity scores for "${processName}":

${scoresText}

The lowest scoring areas are:
${lowestScoring.map((r: { code: string; name: string; score: number }) => `- ${r.code} ${r.name}: ${r.score}/5.0`).join('\n')}

Generate exactly 5 improvement recommendations. Return ONLY valid JSON, nothing else:

{"recommendations":[{"priority":"1","action":"action title here","detail":"specific 2 sentence detail here","impact":"High","effort":"Low","timeline":"1 Quarter","owner":"CFO","l2":"${lowestScoring[0]?.code || '1.1'}"},{"priority":"2","action":"action title here","detail":"specific 2 sentence detail here","impact":"High","effort":"Medium","timeline":"2 Quarters","owner":"Head of FP&A","l2":"${lowestScoring[1]?.code || '1.2'}"},{"priority":"3","action":"action title here","detail":"specific 2 sentence detail here","impact":"High","effort":"Medium","timeline":"2 Quarters","owner":"Finance Director","l2":"${lowestScoring[2]?.code || '1.3'}"},{"priority":"4","action":"action title here","detail":"specific 2 sentence detail here","impact":"Medium","effort":"Medium","timeline":"3 Quarters","owner":"CFO","l2":"${lowestScoring[3]?.code || '1.4'}"},{"priority":"5","action":"action title here","detail":"specific 2 sentence detail here","impact":"Medium","effort":"Low","timeline":"1 Quarter","owner":"Head of FP&A","l2":"${lowestScoring[4]?.code || '1.5'}"}]}`

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const cleaned = content.text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(cleaned)

    return NextResponse.json({ success: true, recommendations: data.recommendations })
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json({ success: false, error: 'Failed to generate recommendations' }, { status: 500 })
  }
}
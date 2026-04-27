import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { l2Results, processName } = await request.json()

    const prompt = `You are an expert Finance Process Intelligence analyst. A user has just completed a maturity assessment for their "${processName}" finance process.

Here are their L2 process scores (out of 5.0):
${l2Results.map((r: { code: string; name: string; score: number; level: string }) => `- ${r.code} ${r.name}: ${r.score}/5.0 (${r.level})`).join('\n')}

Please generate the following in JSON format:

{
  "l2Narratives": {
    "<code>": "<one paragraph narrative for each L2 process explaining what the score means>"
  },
  "strengths": "<2-3 sentence paragraph about what the organisation does well based on highest scoring areas>",
  "strengthQuote": "<one powerful pull quote sentence summarising the key strength>",
  "gaps": "<2-3 sentence paragraph about the most significant gaps based on lowest scoring areas>",
  "gapQuote": "<one powerful pull quote sentence summarising the critical gap>",
  "opportunity": "<2-3 sentence paragraph about the key opportunity to improve maturity>",
  "keyFindings": [
    {"type": "strength", "text": "<specific finding based on actual scores>"},
    {"type": "strength", "text": "<specific finding based on actual scores>"},
    {"type": "gap", "text": "<specific finding based on actual scores>"},
    {"type": "gap", "text": "<specific finding based on actual scores>"},
    {"type": "opportunity", "text": "<specific finding based on actual scores>"},
    {"type": "opportunity", "text": "<specific finding based on actual scores>"}
  ],
  "recommendations": [
    {
      "priority": "1",
      "action": "<specific action title>",
      "detail": "<2-3 sentence description of what to do and why>",
      "impact": "High",
      "effort": "Low",
      "timeline": "<e.g. 1 Quarter>",
      "owner": "<e.g. CFO / Head of FP&A>",
      "l2": "<L2 code this addresses e.g. 1.6>"
    }
  ]
}

Generate 5 recommendations ranked by impact and effort (high impact, low effort first). Base them on the actual lowest scoring processes. Be specific, professional and insightful. Reference actual process names and scores. Return ONLY the JSON object, no other text.`

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    const cleaned = content.text.replace(/```json|```/g, '').trim()
    const insights = JSON.parse(cleaned)

    return NextResponse.json({ success: true, insights })
  } catch (error) {
    console.error('Error generating insights:', error)
    return NextResponse.json({ success: false, error: 'Failed to generate insights' }, { status: 500 })
  }
}
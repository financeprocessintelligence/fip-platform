import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { messages, recommendation, processName, score } = await request.json()

    const systemPrompt = `You are an expert Finance Process Intelligence advisor helping a finance professional implement improvement recommendations.

Context:
- Process assessed: ${processName}
- Overall maturity score: ${score}/5.0
- Current recommendation being discussed:
  - Action: ${recommendation.action}
  - Detail: ${recommendation.detail}
  - Impact: ${recommendation.impact}
  - Effort: ${recommendation.effort}
  - Timeline: ${recommendation.timeline}
  - Suggested Owner: ${recommendation.owner}
  - Related L2 Process: ${recommendation.l2}

Your role is to:
- Help the user understand how to implement this recommendation in their organisation
- Provide practical, specific and actionable advice
- Ask clarifying questions to tailor your advice
- Suggest templates, frameworks or approaches where relevant
- Be concise but thorough
- Always relate your advice back to their specific context and scores

Keep responses focused and practical. Maximum 3-4 paragraphs per response.`

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1000,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content
      }))
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    return NextResponse.json({ success: true, message: content.text })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ success: false, error: 'Failed to get response' }, { status: 500 })
  }
}
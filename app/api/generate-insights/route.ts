import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { l2Results, processName } = await request.json()

    const scoresText = l2Results.map((r: { code: string; name: string; score: number; level: string }) => `- ${r.code} ${r.name}: ${r.score}/5.0 (${r.level})`).join('\n')

    // Call 1: Generate narratives and insights
    const insightsPrompt = `You are an expert Finance Process Intelligence analyst. A user completed a "${processName}" maturity assessment.

Scores:
${scoresText}

Return ONLY this JSON (no markdown, no extra text):
{"l2Narratives":{"1.1":"narrative","1.2":"narrative","1.3":"narrative","1.4":"narrative","1.5":"narrative","1.6":"narrative","1.7":"narrative"},"strengths":"2-3 sentences","strengthQuote":"one quote","gaps":"2-3 sentences","gapQuote":"one quote","opportunity":"2-3 sentences","keyFindings":[{"type":"strength","text":"finding"},{"type":"strength","text":"finding"},{"type":"gap","text":"finding"},{"type":"gap","text":"finding"},{"type":"opportunity","text":"finding"},{"type":"opportunity","text":"finding"}]}`

    // Call 2: Generate recommendations
    const recsPrompt = `You are an expert Finance Process Intelligence analyst. A user completed a "${processName}" maturity assessment.

Scores:
${scoresText}

Generate exactly 5 prioritised recommendations based on the lowest scoring processes. Return ONLY this JSON (no markdown, no extra text):
{"recommendations":[{"priority":"1","action":"title","detail":"2-3 sentences","impact":"High","effort":"Low","timeline":"1 Quarter","owner":"CFO","l2":"1.6"},{"priority":"2","action":"title","detail":"2-3 sentences","impact":"High","effort":"Medium","timeline":"2 Quarters","owner":"Head of FP&A","l2":"1.1"},{"priority":"3","action":"title","detail":"2-3 sentences","impact":"High","effort":"Medium","timeline":"2 Quarters","owner":"Finance Director","l2":"1.2"},{"priority":"4","action":"title","detail":"2-3 sentences","impact":"Medium","effort":"Medium","timeline":"2 Quarters","owner":"CFO","l2":"1.7"},{"priority":"5","action":"title","detail":"2-3 sentences","impact":"Medium","effort":"Low","timeline":"1 Quarter","owner":"Head of FP&A","l2":"1.5"}]}`

    const [insightsResponse, recsResponse] = await Promise.all([
      client.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 3000,
        messages: [{ role: 'user', content: insightsPrompt }],
      }),
      client.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 2000,
        messages: [{ role: 'user', content: recsPrompt }],
      })
    ])

    const insightsContent = insightsResponse.content[0]
    const recsContent = recsResponse.content[0]

    if (insightsContent.type !== 'text' || recsContent.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    const insights = JSON.parse(insightsContent.text.replace(/```json|```/g, '').trim())
    const recs = JSON.parse(recsContent.text.replace(/```json|```/g, '').trim())

    return NextResponse.json({
      success: true,
      insights: { ...insights, recommendations: recs.recommendations }
    })
  } catch (error) {
    console.error('Error generating insights:', error)
    return NextResponse.json({ success: false, error: 'Failed to generate insights' }, { status: 500 })
  }
}
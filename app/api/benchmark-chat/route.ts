import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { messages, benchmarks, overallScore } = await request.json()

    const context = `You are an expert Finance transformation consultant from the Finance Process Intelligence Platform (FPI). The user has completed a Plan to Perform maturity assessment. Here are their scores vs industry benchmarks:
${benchmarks.map((b: any) => `- ${b.label}: score ${b.score}, industry avg ${b.avg}`).join('\n')}
Overall score: ${overallScore}.
Benchmarks are derived from Arpero's proprietary Finance Maturity Index, combining primary research across 200+ Finance functions. Answer questions about their benchmark results concisely and helpfully. Be specific and actionable.`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      system: context,
      messages: messages
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : 'Sorry, I could not generate a response.'
    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Benchmark chat error:', error)
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
  }
}
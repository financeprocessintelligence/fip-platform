import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { l2Results, processName, effortData, hourlyRate, savingPercent } = await request.json()

    const scoresText = l2Results
      .map((r: { code: string; name: string; score: number; level: string }) =>
        `${r.code} ${r.name}: ${r.score}/5.0 (${r.level})`)
      .join('\n')

    const sorted = [...l2Results].sort((a: {score: number}, b: {score: number}) => a.score - b.score)

    const effortText = effortData && effortData.length > 0
      ? '\n\nTeam & Effort Data:\n' + effortData.map((r: any) =>
          `${r.step_code} ${r.step_name}: ${r.headcount || 0} people, ${r.hours_per_cycle || 0} hours/cycle, Roles: ${(r.roles || []).join(', ')}`
        ).join('\n') +
        (hourlyRate ? `\n\nHourly rate: £${hourlyRate}/hour` : '') +
        (savingPercent ? `\nExpected saving: ${savingPercent}%` : '') +
        (hourlyRate && effortData.length > 0 ? `\nTotal current cost/cycle: £${effortData.reduce((sum: number, r: any) => sum + ((r.hours_per_cycle || 0) * hourlyRate), 0).toLocaleString()}` : '')
      : ''

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Finance process maturity scores for ${processName}:\n${scoresText}${effortText}\n\nWhen generating recommendations, factor in the effort data above. Reference specific hours, costs and team sizes where relevant. Mention potential hour savings or cost reductions based on the hourly rate provided.\n\nRespond with only valid JSON matching this exact structure (fill in all values based on the scores above):\n\n{"l2Narratives":{"1.1":"text","1.2":"text","1.3":"text","1.4":"text","1.5":"text","1.6":"text","1.7":"text"},"strengths":"text","strengthQuote":"text","gaps":"text","gapQuote":"text","opportunity":"text","keyFindings":[{"type":"strength","text":"text"},{"type":"strength","text":"text"},{"type":"gap","text":"text"},{"type":"gap","text":"text"},{"type":"opportunity","text":"text"},{"type":"opportunity","text":"text"}],"recommendations":[{"priority":"1","action":"text","detail":"text","impact":"High","effort":"Low","timeline":"1 Quarter","owner":"text","l2":"${sorted[0]?.code}"},{"priority":"2","action":"text","detail":"text","impact":"High","effort":"Medium","timeline":"2 Quarters","owner":"text","l2":"${sorted[1]?.code}"},{"priority":"3","action":"text","detail":"text","impact":"High","effort":"Medium","timeline":"2 Quarters","owner":"text","l2":"${sorted[2]?.code}"},{"priority":"4","action":"text","detail":"text","impact":"Medium","effort":"Medium","timeline":"3 Quarters","owner":"text","l2":"${sorted[3]?.code}"},{"priority":"5","action":"text","detail":"text","impact":"Medium","effort":"Low","timeline":"1 Quarter","owner":"text","l2":"${sorted[4]?.code}"}]}`
      }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const cleaned = content.text.replace(/```json|```/g, '').trim()
    const insights = JSON.parse(cleaned)

    return NextResponse.json({ success: true, insights })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to generate insights' }, { status: 500 })
  }
}
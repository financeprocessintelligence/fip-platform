'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type Recommendation = {
  priority: string
  action: string
  detail: string
  impact: string
  effort: string
  timeline: string
  owner: string
  l2: string
}

type Props = {
  recommendation: Recommendation
  processName: string
  score: number
  onClose: () => void
}

export default function RecommendationChat({ recommendation, processName, score, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatId, setChatId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadOrCreateChat()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadOrCreateChat = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('recommendation_chats')
      .select('*')
      .eq('user_id', user.id)
      .eq('process_name', processName)
      .eq('recommendation_action', recommendation.action)
      .single()

    if (data) {
      setChatId(data.id)
      setMessages(data.messages || [])
    } else {
      const { data: newChat } = await supabase
        .from('recommendation_chats')
        .insert({
          user_id: user.id,
          process_name: processName,
          recommendation_action: recommendation.action,
          messages: []
        })
        .select()
        .single()

      if (newChat) setChatId(newChat.id)

      // Add welcome message
      const welcome: Message = {
        role: 'assistant',
        content: `Hi! I'm here to help you implement **${recommendation.action}**.

This is a **${recommendation.impact} impact, ${recommendation.effort} effort** initiative with a suggested timeline of **${recommendation.timeline}**, owned by **${recommendation.owner}**.

What would you like to know? You could ask me:
- How to get started with this initiative
- What resources or templates you might need
- How to build the business case
- Who to involve and how to manage stakeholders`
      }
      setMessages([welcome])

      if (newChat) {
        await supabase
          .from('recommendation_chats')
          .update({ messages: [welcome] })
          .eq('id', newChat.id)
      }
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/recommendation-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          recommendation,
          processName,
          score
        })
      })

      const data = await response.json()
      if (data.success) {
        const aiMessage: Message = { role: 'assistant', content: data.message }
        const finalMessages = [...updatedMessages, aiMessage]
        setMessages(finalMessages)

        if (chatId) {
          await supabase
            .from('recommendation_chats')
            .update({ messages: finalMessages, updated_at: new Date().toISOString() })
            .eq('id', chatId)
        }
      }
    } catch (e) {
      console.error('Chat error:', e)
    }

    setLoading(false)
  }

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '680px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        
        {/* Header */}
        <div style={{ background: '#0F2744', color: 'white', padding: '20px 24px', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#4fa3e0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>🤖 FPI AI Advisor</div>
            <div style={{ fontSize: '16px', fontWeight: '700' }}>{recommendation.action}</div>
            <div style={{ fontSize: '12px', color: '#a0c4e8', marginTop: '4px' }}>{processName} · L2 {recommendation.l2}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'assistant' && (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0F2744', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', marginRight: '8px', flexShrink: 0, marginTop: '4px' }}>🤖</div>
              )}
              <div style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user' ? '#0F4C81' : '#f4f6f9',
                color: msg.role === 'user' ? 'white' : '#1a1a2e',
                fontSize: '14px',
                lineHeight: '1.6'
              }}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0F2744', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>🤖</div>
              <div style={{ padding: '12px 16px', borderRadius: '16px 16px 16px 4px', background: '#f4f6f9', color: '#666', fontSize: '14px' }}>
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested questions */}
        {messages.length <= 1 && (
          <div style={{ padding: '0 20px 12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['How do I get started?', 'What resources do I need?', 'How do I build the business case?'].map(q => (
              <button key={q} onClick={() => { setInput(q); }} style={{ padding: '6px 12px', background: '#e8f4fd', color: '#0F4C81', border: '1px solid #b8d9f5', borderRadius: '16px', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #e0e4ea', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything about implementing this recommendation..."
            style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', color: '#1a1a2e', outline: 'none' }}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ padding: '10px 20px', background: loading || !input.trim() ? '#ccc' : '#0F4C81', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: loading || !input.trim() ? 'default' : 'pointer' }}>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
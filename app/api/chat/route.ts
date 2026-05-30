import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    // Fetch active listings to give context to the AI
    const supabase = await createClient()
    const { data: listings } = await supabase
      .from('listings')
      .select('title, price, condition, description, categories(name)')
      .eq('status', 'active')
      .limit(20)

    const listingsContext = listings && listings.length > 0
      ? listings.map(l =>
          `- ${l.title} | ₹${l.price} | Condition: ${l.condition} | Category: ${(l.categories as any)?.name}`
        ).join('\n')
      : 'No active listings at the moment.'

    const systemPrompt = `You are CampusBot, a helpful AI assistant for CampusBase — a hyper-local college marketplace for MSRIT students.

You help students:
- Find items they are looking for
- Get information about listed items
- Understand how the platform works
- Know about listing fees (Tier 1: ₹10, Tier 2: ₹15, Tier 3: ₹25)
- Minimum listing price is ₹50
- Items under ₹100 have free listing fee

Current active listings on the platform:
${listingsContext}

Keep responses short, friendly and helpful. You are talking to college students.`

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 500,
    })

    const reply = response.choices[0].message.content

    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error('Chat API error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
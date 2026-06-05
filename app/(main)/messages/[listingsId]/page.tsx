'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ChatPage({ params }: { params: Promise<{ listingId: string }> }) {
  const { listingId } = React.use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const receiverId = searchParams.get('with')
  const supabase = createClient()

  const [messages, setMessages] = useState<any[]>([])
  const [listing, setListing] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [otherUser, setOtherUser] = useState<any>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCurrentUser()
    fetchListing()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    fetchMessages(user.id)
    fetchOtherUser()

    // Mark messages as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('listing_id', listingId)
      .eq('receiver_id', user.id)
      .eq('sender_id', receiverId)
  }

  async function fetchListing() {
    const { data } = await supabase
      .from('listings')
      .select('id, title, price, image_urls')
      .eq('id', listingId)
      .single()
    if (data) setListing(data)
  }

  async function fetchOtherUser() {
    if (!receiverId) return
    const { data } = await supabase
      .from('profiles')
      .select('full_name, college_name, semester')
      .eq('id', receiverId)
      .single()
    if (data) setOtherUser(data)
  }

  async function fetchMessages(userId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('listing_id', listingId)
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${userId})`
      )
      .order('created_at', { ascending: true })

    if (data) setMessages(data)
    if (error) console.error(error)
    setLoading(false)

    // Realtime subscription
    supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `listing_id=eq.${listingId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()
  }

  async function sendMessage() {
    if (!input.trim() || !currentUser || !receiverId) return
    setSending(true)

    const { error } = await supabase
      .from('messages')
      .insert({
        listing_id: listingId,
        sender_id: currentUser.id,
        receiver_id: receiverId,
        content: input.trim(),
      })

    if (!error) setInput('')
    setSending(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push('/messages')}
            className="text-gray-500 hover:text-gray-800 text-sm"
          >
            ← Back
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {otherUser?.full_name}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {listing?.title} · ₹{listing?.price}
            </p>
          </div>
          {listing?.image_urls?.[0] && (
            <img
              src={listing.image_urls[0]}
              className="w-10 h-10 rounded-lg object-cover shrink-0"
            />
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-4 space-y-3 overflow-y-auto">
        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                msg.sender_id === currentUser?.id
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 rounded-bl-sm border'
              }`}>
                {msg.content}
                <p className={`text-xs mt-1 ${
                  msg.sender_id === currentUser?.id ? 'text-blue-200' : 'text-gray-400'
                }`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t px-4 py-3 sticky bottom-0">
        <div className="max-w-lg mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            Send
          </button>
        </div>
      </div>

    </div>
  )
}
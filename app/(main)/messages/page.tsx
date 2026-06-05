'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function MessagesPage() {
  const router = useRouter()
  const supabase = createClient()

  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  async function fetchCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    fetchConversations(user.id)
  }

  async function fetchConversations(userId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        listing:listings(id, title, image_urls),
        sender:profiles!messages_sender_id_fkey(id, full_name),
        receiver:profiles!messages_receiver_id_fkey(id, full_name)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (data) {
      // Group by listing + other person
      const seen = new Set()
      const unique = data.filter(msg => {
        const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
        const key = `${msg.listing_id}-${otherId}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      setConversations(unique)
    }
    if (error) console.error(error)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push('/feed')}
            className="text-gray-500 hover:text-gray-800 text-sm"
          >
            ← Back
          </button>
          <h1 className="text-lg font-bold text-gray-800">Messages</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm mt-1">Start a conversation by contacting a seller!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map(conv => {
              const otherId = conv.sender_id === currentUser?.id ? conv.receiver_id : conv.sender_id
              const otherPerson = conv.sender_id === currentUser?.id ? conv.receiver : conv.sender
              return (
                <div
                  key={`${conv.listing_id}-${otherId}`}
                  onClick={() => router.push(`/messages/${conv.listing_id}?with=${otherId}`)}
                  className="bg-white rounded-2xl border p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition"
                >
                  {/* Listing image */}
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                    {conv.listing?.image_urls?.[0] ? (
                      <img src={conv.listing.image_urls[0]} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {conv.listing?.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {otherPerson?.full_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 truncate">{conv.content}</p>
                  </div>

                  {!conv.is_read && conv.receiver_id === currentUser?.id && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
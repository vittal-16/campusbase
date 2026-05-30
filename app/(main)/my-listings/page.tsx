'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function MyListingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyListings()
  }, [])

  async function fetchMyListings() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('listings')
      .select(`*, categories(name, tier)`)
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setListings(data)
    if (error) console.error(error)
    setLoading(false)
  }

  async function handleDelete(listingId: string) {
    const confirm = window.confirm('Are you sure you want to delete this listing?')
    if (!confirm) return

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId)

    if (!error) {
      setListings(prev => prev.filter(l => l.id !== listingId))
    }
  }

  async function handleMarkSold(listingId: string) {
    const { error } = await supabase
      .from('listings')
      .update({ status: 'sold' })
      .eq('id', listingId)

    if (!error) {
      setListings(prev =>
        prev.map(l => l.id === listingId ? { ...l, status: 'sold' } : l)
      )
    }
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      pending_payment: 'bg-yellow-100 text-yellow-700',
      sold: 'bg-gray-100 text-gray-500',
      expired: 'bg-red-100 text-red-500',
    }
    return styles[status] || 'bg-gray-100 text-gray-500'
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/feed')}
              className="text-gray-500 hover:text-gray-800 text-sm"
            >
              ← Back
            </button>
            <h1 className="text-lg font-bold text-gray-800">My Listings</h1>
          </div>
          <button
            onClick={() => router.push('/listings/new')}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            + New Listing
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading...</div>
        ) : listings.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <p className="text-lg font-medium">No listings yet</p>
            <p className="text-sm mt-1">Start selling something!</p>
            <button
              onClick={() => router.push('/listings/new')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              + Create Listing
            </button>
          </div>
        ) : (
          listings.map(listing => (
            <div key={listing.id} className="bg-white rounded-2xl border p-4 flex gap-4">

              {/* Image */}
              <div className="bg-gray-100 rounded-xl w-20 h-20 flex items-center justify-center shrink-0">
                <span className="text-3xl">📦</span>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-800 truncate">{listing.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${getStatusBadge(listing.status)}`}>
                    {listing.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{listing.categories?.name}</p>
                <p className="text-blue-600 font-bold text-sm mt-1">₹{listing.price}</p>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => router.push(`/listings/${listing.id}`)}
                    className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition"
                  >
                    View
                  </button>
                  {listing.status === 'active' && (
                    <button
                      onClick={() => handleMarkSold(listing.id)}
                      className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition"
                    >
                      Mark as Sold
                    </button>
                  )}
                  {listing.status !== 'sold' && (
                    <button
                      onClick={() => handleDelete(listing.id)}
                      className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}